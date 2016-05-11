const couchbase = require('couchbase');
const nsq = require('nsq.js');
const uuid = require('node-uuid')

const cluster = new couchbase.Cluster('couchbase://localhost')
const bucket = cluster.openBucket('default')
const writer = nsq.writer(':4150')

function withBucket(bucket) {
  return function(fn) {
    return function(props) {
      return fn(bucket, props)
    }
  }
}

const withDefaultBucket = withBucket(bucket)

function withReader(fn) {
  return function(props) {
    let reader = nsq.reader({
      nsqd: [':4150'],
      maxInFlight: 1,
      maxAttempts: 5,
      topic: `${codeId}#ephemeral`,
      channel: 'ingestion#ephemeral'
    })
  }
}

function awaitCodeResult({codeId}) {
  return new Promise((resolve, reject) => {
    let reader = nsq.reader({
      nsqd: [':4150'],
      maxInFlight: 1,
      maxAttempts: 5,
      topic: `${codeId}#ephemeral`,
      channel: 'sub#ephemeral'
    })

    reader.on('message', function(msg) {
      msg.finish()
      reader.close()
      resolve(msg)
    })

    reader.on('error', function(err) {
      reject(err)
    })
  })
}

function publishCode({codeId, resultId, inputId, runner}) {
  let body = JSON.stringify({codeId, resultId, inputId, runner})
  writer.publish('coderunner', body)
  setTimeout(() => {
    writer.publish(`${codeId}#ephemeral`, body)
  }, 2000)

  let reader = nsq.reader({
    nsqd: [':4150'],
    maxInFlight: 1,
    maxAttempts: 5,
    topic: `${codeId}#ephemeral`,
    channel: 'ingestion#ephemeral'
  })

  reader.on('message', function(msg) {
    console.log("got msg")
    console.log(msg.body.toString())
    msg.finish();
    setTimeout(() => reader.close(), 1000);
  });
}

const postCode = withDefaultBucket((bucket, {id, code}) => {
  return new Promise((resolve, reject) => {
    bucket.insert(id, code, (err, res) => {
      if (err) {
        reject(err)
      } else {
        console.log(res)
        resolve(id)
      }
    });
  });
});

const getCode = withDefaultBucket((bucket, {codeId}) => {
  return new Promise((resolve, reject) => {
    bucket.get(codeId, (err, res) => {
      if (err) {
        return reject(err)
      }
      let {cas, value} = res
      resolve(value)
    })
  })
})

module.exports = {
  postCode,
  publishCode,
  getCode,
  awaitCodeResult,
}

