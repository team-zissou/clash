const http = require('http');
const express = require('express');
const uuid = require('node-uuid');
const bodyParser = require('body-parser');
const couchbase = require('couchbase');
const nsq = require('nsq.js');
const r = require('rethinkdb');

let conn;
const nsqd_host = process.env.NSQD_HOST;
const dockerhost = process.env.dockerhost;

r.connect({host:dockerhost, db:'test'}, (err, c) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  conn = c;
});

const app = express();
const router = express.Router();

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

router.post('/run/:language', (req, res) => {
  const { langauge } = req.params;
});

app.use(express.static('public'));
app.use('/api', router);

http.createServer(app).listen(8080);
