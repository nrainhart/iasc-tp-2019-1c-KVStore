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

app.post('/nodoDatos/maxSize', function (req, res) {
  const maxSize = req.query.valor;
  if (maxSize){
    app.maxSize = maxSize;
    console.log('Key/Value max Size: ' + app.maxSize);
    res.status(200).send('Key/Value max Size: ' + app.maxSize);
  } else {
    res.status(400).send("ERROR");
  }
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

app.delete('/nodoDatos/quitar', function(req, res) {
  const key = req.query.key;
  console.log("quitando key: " + key);
  if(paresClaveValor.delete(key)) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get('/nodoDatos/obtenerValor', function(req, res) {
    const key = req.query.key;
    console.log("leyendo key: " + key);
    const valorConTimestamp = paresClaveValor.get(key);
    if(valorConTimestamp) {
      res.send(valorConTimestamp.value);
    } else {
      res.sendStatus(404);
    }
  });

app.get('/nodoDatos/obtenerMapa', function(req, res) {
  const cond = req.query.condition;
  const value = req.query.value;
  const map1 = new Array();
  [...paresClaveValor]
  .filter(([k, v]) => estaCorrecto(v.value, cond, value ))
  .map(([k, v]) => { map1.push(v) });
  console.log(map1.length);
  res.send(map1);
});

app.post('/nodoDatos/guardar', function(req, res) {
  const key = req.body.key;
  if(paresClaveValor.size < app.maxSize){
    const value = req.body.value;
    console.log("guardando key: " + key);
    const valorConTimestamp = {
      'value': value,
      'timestamp': new Date()
    };
    paresClaveValor.set(key, valorConTimestamp);
    res.send("OK");
  } else {
    console.log("No hay espacio para key: " + key);
    res.status(400).send("Overflow");
  }
});

app.listen(8050, function () {
  console.log('App listening on port: ' + args['port']);
  app.maxSize = args['maxSize'] ? args['maxSize'] : 5;
  console.log('Key/Value max Size: ' + app.maxSize);
});

function estaCorrecto(valorClave, cond, valorCondicion) {
 if(cond == 'Mayor'){
    return valorClave > valorCondicion
  } else if(cond == 'Menor') {
    return  valorClave < valorCondicion
  }
  return false;
}