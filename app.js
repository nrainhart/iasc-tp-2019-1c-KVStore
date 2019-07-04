var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var map = new Map();

// respond with "hello world" when a GET request is made to the homepage
app.get('/api/saludar', function(req, res) {
  res.send('hello world');
});

app.get('/api/conseguir', function(req, res) {
    var data = map.get(req.query.key);
    res.send(data);
  });

app.post('/api/insertar', function(req, res) {
    map.set(req.body.key, req.body.value);
    res.send("OK");
});

app.listen(3000);