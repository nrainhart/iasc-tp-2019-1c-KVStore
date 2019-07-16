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

app.get('/api/saludar', (_, res) => {
  res.send('hello world');
});

app.post('/api/maxSize',  (req, res) => {
  const maxSize = req.query.valor;
  if (maxSize){
    app.maxSize = maxSize;
    console.log(`Key/Value max Size: ${app.maxSize}`);
    res.status(200).send(`Key/Value max Size: ${app.maxSize}`);
  } else {
    res.status(400).send("ERROR");
  }
});

app.get('/api/conseguir', (req, res) => {
  validarQueSoyMaster();
  const key = req.query.key;
  console.log('leyendo key: ' + key);
  ring.find(key)
    .then((response) => res.status(200).send(response))
    .catch(() => res.status(500).send(`Ocurrio un error leyendo la key: ${key}`));
});

app.get('/api/conseguirFiltrados', (req, res) => {
  validarQueSoyMaster();
  const cond = req.query.condicion;
  const valor = req.query.valor;
  ring.findFilteredValues(cond, valor)
    .then((response) => res.send(response))
    .catch(() => res.send('No hay ningún valor que compla la condición'));
});

app.post('/api/insertar', (req, res) => {
  validarQueSoyMaster();
  const key = req.body.key;
  const value = req.body.value;
  if (key.length <= app.maxSize && value.length <= app.maxSize){
    console.log(`guardando key: ${key}`);
    ring.save(key, value)
      .then(() => res.status(200).send("OK"))
      .catch(() => res.status(500).send(`Ocurrio un error guardando el par(${key},${value})`));
  } else {
    console.log("La clave/valor supera el Tamaño Máximo");
    res.status(412).send(`La clave ingresada superan el tamaño máximo: ${app.maxSize}`);
  }
});

app.delete('/api/quitar', (req, res) => {
  validarQueSoyMaster();
  const key = req.query.key;
    console.log(`quitando key: ${key}`);
    ring.delete(key)
      .then(() => res.status(200).send("OK"))
      .catch(() => res.status(500).send(`Ocurrio un error quitando la clave(${key})`));
});

function validarQueSoyMaster() {
  if(!coordinadorDeOrquestadores.soyMaster()) {
    throw Error('No soy el nodo maestro');
  }
};

let masterErrorHandler = (err, req, res, next) => {
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
  console.log(`App listening on port: ${args['port']}`);
  app.maxSize = args['maxSize'] ? args['maxSize'] : 5;
  console.log(`Key/Value max Size: ${app.maxSize}`);
});
