const http = require('http');
const express = require('express');
const uuid = require('node-uuid');
const bodyParser = require('body-parser');
const couchbase = require('couchbase');
const nsq = require('nsq.js');

const router = express.Router();
const app = express();
app.use(bodyParser());

const nsqd_host = process.env.NSQD_HOST;

let todos = [
  createTodo("add uuid to packages"),
  createTodo("install packages"),
  createTodo("change server port"),
];

function createTodo(todo) {
  return {
    id: uuid.v4(),
    todo,
  };
}

router.get('/todos/:id', (req, res) => {
  const { id } = req.params;
  let match = todos.filter(x => x.id === id);
  res.json(match);
});

router.get('/todos', (req, res) => {
  res.json(todos);
});

router.post('/run/:language', (req, res) => {
  const { langauge } = req.params;

});

app.use(express.static('public'));
app.use('/api', router);

http.createServer(app).listen(8080);
