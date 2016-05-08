const http = require('http');
const express = require('express');
const WebSocket = require('ws').Server;
const uuid = require('node-uuid');
const bodyParser = require('body-parser');
const couchbase = require('couchbase');
const nsq = require('nsq.js');

const { createAccount, createLogin } = require('./server/accounts');
const websocketHandler = require('./server/websocketHandler');

const { subscribe, createClash } = require('./server/clashes')

let conn;
const nsqd_host = process.env.NSQD_HOST;
const dockerhost = process.env.dockerhost;


const reader = nsq.reader({
  nsqd: [':4150'],
  maxInFlight: 1,
  maxAttempts: 5,
  topic: 'events',
  channel: 'ingestion'
});
reader.on('error', function(err){
    console.log(err.stack);
});
reader.on('message', function(msg){
  var body = msg.body.toString();
  console.log('%s attempts=%s', body, msg.attempts);
  msg.requeue(2000);
});

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

router.post('/run/:language', (req, res) => {
  const { langauge } = req.params;
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


app.use(express.static('public'));
app.use('/api', router);

server.listen(8080);
