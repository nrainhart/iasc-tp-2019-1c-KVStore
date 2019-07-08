const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2))

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/nodoDatos/hi', function(req, res) {
  res.send('hello world');
});

app.listen(args['port'], function () {
  console.log('App listening on port: ' + args['port']);
});
