const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))
const store = require('./store').store;

//-------mover estooooo---------//
var ConsistentHashing = require('consistent-hashing');

//asi me gustaria que se llame el archivo en donde la papa va a estar...
var nodeLocator = new ConsistentHashing(["node1", "node2", "node3"]);

/*var nodes = {};
var chars = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
  'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
  'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

chars.forEach(function(c) {
  var node = nodeLocator.getNode(c);

  if (nodes[node]) {
    nodes[node].push(c);
  } else {
    nodes[node] = [];
    nodes[node].push(c);
  }
});*/

//console.log(nodes);
//-----------------------------//
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// respond with "hello world" when a GET request is made to the homepage
app.get('/api/saludar', function(req, res) {
  res.send('hello world');
});

app.get('/api/conseguir', function(req, res) {
    const data = store.get(req.query.key);
    res.send(data);
  });

app.post('/api/insertar', function(req, res) {
    store.put(req.body.key, req.body.value);
    res.send("OK");
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});