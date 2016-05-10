const http = require('http')
const express = require('express')
const WebSocket = require('ws').Server
const uuid = require('node-uuid')
const bodyParser = require('body-parser')

const {
  createAccount,
  createLogin,
  createQuestion,
  createTest,
  getTests,
  getQuestions,
  getAccount,
  _createLogin,
} = require('./server/accounts')
const websocketHandler = require('./server/websocketHandler')

const { subscribe, createClash, joinClash, leaveClash, getClash } = require('./server/clashes')
const { postCode, publishCode } = require('./server/coderunner')

const app = express()
const router = express.Router()

const server = http.createServer()
const wss = new WebSocket({server})
wss.on('connection', websocketHandler)
server.on('request', app)

function authed (fn) {
  return function(req, res) {
    const { authorization } = req.headers
    if (!authorization) {
      return res.sendStatus(401)
    }

    getAccount({loginToken: authorization})
      .then(({rows}) => {
        if (rows.length) {
          const { id, email, username } = rows[0]
          console.log("authed as ", id, email, username)
          req.user = { id, email, username }
          fn(req, res)
        } else {
          res.sendStatus(401)
        }
      })
      .catch(xs => console.error(xs))
  }
}

app.use(function readBody (req, res, next) {
    var data = ''
    req.setEncoding('utf8')
    req.on('data', function(chunk) {
        data += chunk
    })
    req.on('end', function() {
        req.body = data
        next()
    })
})


router.post('/accounts', (req, res) => {
  const id = uuid.v4()
  createAccount({id, email:"slofurno@gmail.com", password:"asdf", username:"papa_steve"})
    .then(() => _createLogin({accountId: id}))
    .then(({accountId, id}) => res.json({accountId, token: id}))
    .catch(err => console.error(err))
})

router.post('/accounts/login', (req, res) => {
  createLogin({email: "slofurno@gmail.com", password: "asdf"})
    .then(row => console.log(row))
})

router.post('/clashes', authed((req, res) => {
  const clash = {
    id: uuid.v4(),
    question: '7d43c01d-09ad-4928-8ca0-df8bcbd5ee3b'
  }

  createClash(clash)
  .then(() => res.json(clash))
  .catch(err => console.error(err))
}))

router.get('/clashes/:clashId', (req, res) => {
  const { clashId } = req.params

  getClash({id: clashId})
    .then(result => res.json(result))
    .catch(err => console.error(err))
})

router.post('/clashes/:clashId/join', authed((req, res) => {
 // const x = JSON.parse(req.body)
  const { clashId } = req.params
  const { user } = req
  joinClash({clashId, user})
   .then(x => {
      res.sendStatus(200)
   })
}))

router.post('/clashes/:clashId/leave', authed((req, res) => {
 // const x = JSON.parse(req.body)
  const { clashId } = req.params
  leaveClash({clashId, userId: req.user.id})
   .then(x => {
      res.sendStatus(200)
   })
}))

const exampleCode = {
  code: `console.log("hello world")`,
  runner: "js",
}

router.post('/runner', (req, res) => {
  postCode(exampleCode)
    .then(x => {
      console.log(x)
      res.sendStatus(200)
    })
    .catch(x => console.log(x))
})

router.post('/runnert', authed((req, res) => {
  res.sendStatus(200)
  postCode(exampleCode)
    .then(id =>
      publishCode({
        codeId: id,
        resultId: uuid.v4(),
        inputId: uuid.v4(),
        runner: "js"
      })
    )
}))

router.post('/questions', (req, res) => {
  let question = {
    id: uuid.v4(),
    owner: "slofurno",
    question: "find the intersection of the two sets"
  }

  createQuestion(question)
    .then(result => {
      res.json(question)
    })
    .catch(err => console.log(err))
})

router.get('/questions', (req, res) => {
  getQuestions()
    .then(({rows}) => res.json(rows))
    .catch(err => console.log(err))

})

router.post('/questions/:question/tests', (req, res) => {
  const { question } = req.params
  const input = `1 5 8 9 14
  3 6 8 10 14`

  const output = `8 14`

  let test = {
    id: uuid.v4(),
    question,
    input,
    output
  }

  createTest(test)
    .then(() => {
      res.json(test)
    })
    .catch(err => console.log(err))
})

router.get('/questions/:question/tests', (req, res) => {
  const { question } = req.params
  getTests({question})
    .then(({rows}) => {
      res.json(rows)
    })
    .catch(err => console.log(err))
})

app.use(express.static('public'))
app.use('/api', router)

server.listen(8080)
