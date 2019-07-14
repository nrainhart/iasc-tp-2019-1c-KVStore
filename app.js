const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))
const ring = require('./ring').ring;
const { CoordinadorDeOrquestadores, CoordinadorDeOrquestadoresMockeado } = require('./CoordinadorDeOrquestadores');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const myKey = Math.random().toString(36).substring(7);

const coordinarMasterConOtrosNodos = false;
const coordinadorDeOrquestadores = coordinarMasterConOtrosNodos ?
  new CoordinadorDeOrquestadores(myKey) :
  new CoordinadorDeOrquestadoresMockeado;

app.get('/api/saludar', function (req, res) {
  res.send('hello world');
});

app.get('/api/conseguir', function (req, res) {
  validarQueSoyMaster();
  const key = req.query.key;
  console.log('leyendo key: ' + key);
  ring.find(key)
    .then((response) => res.send(response))
    .catch(() => res.send('Ocurrio un error leyendo la key: ' + key));
});

app.post('/api/insertar', function(req, res) {
  validarQueSoyMaster();
  const key = req.body.key;
  const value = req.body.value;
  console.log("guardando key: " + key);
  ring.save(key, value)
    .then(() => res.send("OK"))
    .catch(() => res.send("Ocurrio un error guardando el par(" + key + ", " + value + ")"));
});

function validarQueSoyMaster() {
  if(!coordinadorDeOrquestadores.soyMaster()) {
    throw Error('No soy el nodo maestro');
  }
}

let masterErrorHandler = function(err, req, res, next) {
  res.status(400).json({ error: err.toString() });
};
app.use(masterErrorHandler);

if(coordinarMasterConOtrosNodos) {
  setInterval(function () {
    if (coordinadorDeOrquestadores.soyMaster(myKey)) {
      console.log('Soy master');
    } else {
      console.log('No soy master');
    }
  }, 3000);
};

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});