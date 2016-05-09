const nsq = require('nsq.js');
const { getCode } = require('../server/coderunner')

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
  console.log("got msg")
  const { body } = msg
  let job = JSON.parse(body.toString())
  console.log(job)
  getCode(job)
  .then(({cas, value}) => console.log(value))
  .catch(err => console.log(err))
  msg.finish();
});
