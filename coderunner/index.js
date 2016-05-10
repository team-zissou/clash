const os = require('os')
const fs = require('fs')
const child_process = require('child_process')

const uuid = require('node-uuid')
const nsq = require('nsq.js');

const { getCode } = require('../server/coderunner')
const tempDir = os.tmpdir()
const codef = `${tempDir}/${uuid.v4()}`

let jobs = []
let inProgress = false

function processJob() {
  if (inProgress || jobs.length === 0) {
    return
  }

  inProgress = true
  let [{code, resultId, runner, input}, ...xs] = jobs
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
      console.log(stdout)
      console.log(stderr)
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

  getCode(job)
  .then(({code, runner}) => jobs = jobs.concat({code, resultId, runner, input:"TODO"}))
  .catch(err => {
    console.log("error getting code")
    console.log(err)
  })
  msg.finish();
});

setInterval(processJob, 200)
