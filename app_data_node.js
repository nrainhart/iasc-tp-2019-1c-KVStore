const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))
const Node = require('./data_node');

var dataNodes = [];

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/nodoDatos/hi', function(req, res) {
  res.send('hello world');
});

app.get('/nodoDatos/obtener', function(req, res) {
    const key = req.query.key;
    console.log("leyendo key: " + key);
    const data = dataNodes.find(nodoDeDatos => nodoDeDatos.getKey() === key).getValue();
    res.send(data);
  });


app.post('/nodoDatos/guardar', function(req, res) {
    const key = req.body.key;
    const value = req.body.value;
    console.log("guardando key: " + key);
    dataNodes.push(new Node(key, value));
    res.send("OK");
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});
