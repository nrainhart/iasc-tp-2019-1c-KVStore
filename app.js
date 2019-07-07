const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))
const store = require('./store').store;

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