const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2));

var paresClaveValor = new Map();

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/nodoDatos/hi', (_, res) => {
  res.send('hello world');
});

app.get('/nodoDatos/health-check', function(req, res) {
  res.send("UP");
});

app.post('/nodoDatos/maxSize', (req, res) => {
  const maxSize = req.query.valor;
  if (maxSize){
    app.maxSize = maxSize;
    console.log(`Key/Value max Size: ${app.maxSize}`);
    res.status(200).send(`Key/Value max Size: ${app.maxSize}`);
  } else {
    res.status(400).send("ERROR");
  }
});

app.get('/nodoDatos/obtener', (req, res) => {
    const key = req.query.key;
    console.log(`leyendo key: ${key}`);
    const valorConTimestamp = paresClaveValor.get(key);
    valorConTimestamp ? res.send(valorConTimestamp) : res.sendStatus(404);
});

app.delete('/nodoDatos/quitar', (req, res) => {
  const key = req.query.key;
  console.log(`quitando key: ${key}`);
  paresClaveValor.delete(key) ? res.sendStatus(200) : res.sendStatus(404);
});

app.get('/nodoDatos/obtenerValor', (req, res) => {
    const key = req.query.key;
    console.log(`leyendo key: ${key}`);
    const valorConTimestamp = paresClaveValor.get(key);
    valorConTimestamp ? res.send(valorConTimestamp.value) : res.sendStatus(404);
});

app.get('/nodoDatos/filtroPorCondicion', (req, res) => {
  const cond = req.query.condicion;
  const valorCondicion = req.query.valor;
  const listaDeDatos = Array.from(paresClaveValor.values())
  let valores = listaDeDatos.filter(valor => estaCorrecto(valor.value, cond, valorCondicion));
  res.send(valores);
});

app.post('/nodoDatos/guardar', (req, res) => {
  const key = req.body.key;
  if(paresClaveValor.size < app.maxSize){
    const value = req.body.value;
    console.log(`guardando key: ${key}`);
    const valorConTimestamp = {
      'value': value,
      'timestamp': new Date()
    };
    paresClaveValor.set(key, valorConTimestamp);
    res.send("OK");
  } else {
    console.log(`No hay espacio para key: ${key}`);
    res.status(400).send("Overflow");
  }
});

app.post('/nodoDatos/mori', function(req, res) {
  console.log("Muriendo...");
  res.sendStatus(200);
  process.exit(1);
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
  app.maxSize = args['maxSize'] ? args['maxSize'] : 5;
  console.log(`Key/Value max Size: ${app.maxSize}`);
});

function estaCorrecto(valorClave, cond, valorCondicion) {
 if(cond == 'Mayor'){
    return valorClave > valorCondicion
  } else if(cond == 'Menor') {
    return  valorClave < valorCondicion
  }
  return false;
};