const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))

var paresClaveValor = new Map();


const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/nodoDatos/hi', function(req, res) {
  res.send('hello world');
});

app.get('/nodoDatos/obtener', function(req, res) {
    const key = req.query.key;
    console.log("leyendo key: " + key);
    const valorConTimestamp = paresClaveValor.get(key);
    if(valorConTimestamp) {
      res.send(valorConTimestamp);
    } else {
      res.sendStatus(404);
    }
  });


app.post('/nodoDatos/guardar', function(req, res) {
    const key = req.body.key;
    const value = req.body.value;
    console.log("guardando key: " + key);
    const valorConTimestamp = {
      'value': value,
      'timestamp': new Date()
    };
    paresClaveValor.set(key, valorConTimestamp);
    res.send("OK");
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});
