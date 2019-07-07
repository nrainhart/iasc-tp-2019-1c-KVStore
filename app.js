const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))
const ring = require('./ring').ring;

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// respond with "hello world" when a GET request is made to the /api/saludar
app.get('/api/saludar', function(req, res) {
  res.send('hello world');
});

app.get('/api/conseguir', function(req, res) {
    const key = req.query.key;
    console.log("leyendo key: " + key);
    const data = ring.find(key);
    res.send(data);
  });

app.post('/api/insertar', function(req, res) {
    const key = req.body.key;
    const value = req.body.value;
    console.log("guardando key: " + key);
    ring.save(key, value);
    res.send("OK");
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});