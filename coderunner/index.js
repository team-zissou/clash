const os = require('os')
const fs = require('fs')
const diff = require('diff')
const child_process = require('child_process')

const uuid = require('node-uuid')
const nsq = require('nsq.js');

const { getCode, postCode } = require('../server/coderunner')
const { getInput } = require('../server/accounts')

const tempDir = os.tmpdir()
const codef = `${tempDir}/${uuid.v4()}`

let jobs = []
let inProgress = false

function processJob() {
  if (inProgress || jobs.length === 0) {
    return
  }

  inProgress = true
  let [{code, resultId, runner, input, output}, ...xs] = jobs
  jobs = xs

  let fd = fs.openSync(codef, 'w+')

  let toWrite = `
  const input = \`${input}\`

  ${code}
  `

  let n = fs.writeSync(fd, toWrite, 0, 'utf8')
  console.log(`${n} bytes written`)
  fs.closeSync(fd)

  const processOutput = (err, stdout, stderr) => {
    if (err) {
      console.error(err)
    } else {
      console.log("stdout: ", stdout)
      console.log("expected: ", output)
      let dx = diff.diffLines(output, stdout, {ignoreWhitespace: true})
      postCode({id: resultId, code: dx})
      console.log(dx)
    }
    inProgress = false
  }

  const opts = {timeout: 2000}
  const child = child_process.exec(`node ${codef}`, opts, processOutput)
}

let reader = nsq.reader({
  nsqlookupd: ['0.0.0.0:4161'],
  maxInFlight: 1,
  maxAttempts: 5,
  topic: "coderunner",
  channel: 'coderunner1'
})

reader.on('error', function(err){
    console.log(err.stack);
});

reader.on('message', function(msg) {
  const { body } = msg
  let job = JSON.parse(body.toString())
  const { codeId, resultId, inputId, runner } = job

  Promise.all([getCode(job), getInput({ id: inputId })])
  .then(([{ code, runner }, { ['rows']: [{ input, output }] }]) => {
    jobs = jobs.concat({ code, resultId, runner, input, output })
  })
  .catch(err => console.log(err))

  msg.finish();
});

setInterval(processJob, 200)
