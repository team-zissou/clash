import expect from 'expect'
import nsq from 'nsq.js'
import { publishCode } from '../server/coderunner'

describe('publish jobs', function() {
  it('published jobs should be received by runner', function(done) {
    let reader = nsq.reader({
      nsqlookupd: ['0.0.0.0:4161'],
      maxInFlight: 1,
      maxAttempts: 5,
      topic: "coderunner",
      channel: 'coderunner1'
    })

    const my_msg = {
      codeId: '1234',
      resultId: '1234',
      inputId: '1234',
      runner: "js"
    }

    reader.on('message', function(msg) {
      console.log("got msg")
      const { body } = msg
      let job = JSON.parse(body.toString())
      expect(job).toEqual(my_msg)
      msg.finish()
      reader.close()
      done()
    })

    publishCode(my_msg)
  })
})
