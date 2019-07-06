const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2));

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let soyMaster = true;
const map = new Map();

// respond with "hello world" when a GET request is made to the homepage
app.get('/api/saludar', function (req, res) {
  res.send('hello world');
});

app.get('/api/conseguir', function (req, res) {
  validarQueSoyMaster();
  let key = req.query.key;
  let data = map.get(key);
  if(data !== undefined) {
    res.send(data);
  } else {
    res.status(404).json({ error: `No se encontró la clave [${key}]`});
  }
});

app.post('/api/insertar', function (req, res) {
  validarQueSoyMaster();
  let key = req.body.key;
  let value = req.body.value;
  map.set(key, value);
  res.send('OK');
});

function validarQueSoyMaster() {
  if(!soyMaster) {
    throw Error('No soy el nodo maestro');
  }
}

let masterErrorHandler = function(err, req, res, next) {
  res.status(400).json({ error: err.toString() });
};
app.use(masterErrorHandler);

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});