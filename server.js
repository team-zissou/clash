const http = require('http');
const express = require('express');
const WebSocket = require('ws').Server;
const uuid = require('node-uuid');
const bodyParser = require('body-parser');

const { createAccount, createLogin } = require('./server/accounts');
const websocketHandler = require('./server/websocketHandler');

const { subscribe, createClash, joinClash, leaveClash } = require('./server/clashes')
const { postCode, publishCode } = require('./server/coderunner')

const app = express();
const router = express.Router();

const server = http.createServer();
const wss = new WebSocket({server});
wss.on('connection', websocketHandler);
server.on('request', app);

app.use(function readBody (req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        req.body = data;
        next();
    });
});

router.post('/todos', (req, res) => {
  let body = req.body;
  r.table('todos').insert({todo: body}).run(conn, (err, row) => {
    res.send(row.generated_keys[0])
  });
});

router.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  let todos = [];
  r.table('todos').filter({id}).run(conn, (err, cursor) => {
    cursor.toArray((err, arr) => {
      res.json(arr);
    });
  });
});

router.get('/todos', (req, res) => {
  r.table('todos').run(conn, (err, cursor) => {
    cursor.toArray((err, arr) => {
      res.json(arr);
    });
  })
});

router.post('/events', (req, res) => {
  const writer = nsq.writer(':4150');
  writer.on('error', function(err){
      console.log(err.stack);
  });
  writer.on('ready', () => {
    writer.publish('events', 'foo');
    writer.publish('events', 'bar');
    writer.publish('events', 'baz');
  });
});

router.post('/accounts', (req, res) => {
  createAccount({email:"slofurno@gmail.com", password:"asdf", username:"papa_steve"});
});

router.post('/accounts/login', (req, res) => {
  createLogin({email: "slofurno@gmail.com", password: "asdf"})
    .then(row => console.log(row));
});

router.post('/clashes', (req, res) => {
  createClash()
  .then(id => {
    res.send(id)
  })
  .catch(err => console.error(err))
});

router.post('/clashes/:clashId/join', (req, res) => {
 // const x = JSON.parse(req.body)
  const { clashId } = req.params
  joinClash({clashId, userId: '12345'})
   .then(x => {
      res.sendStatus(200)
   })
})

router.post('/clashes/:clashId/leave', (req, res) => {
 // const x = JSON.parse(req.body)
  const { clashId } = req.params
  leaveClash({clashId, userId: '12345'})
   .then(x => {
      res.sendStatus(200)
   })
})

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

router.post('/runnert', (req, res) => {
  res.sendStatus(200)
  publishCode({
    codeId: uuid.v4(),
    resultId: uuid.v4(),
    inputId: uuid.v4(),
    runner: "js"
  })
})


app.use(express.static('public'));
app.use('/api', router);

server.listen(8080);
