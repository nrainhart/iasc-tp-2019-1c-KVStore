const express = require('express');
const bodyParser = require('body-parser');
const args = require('minimist')(process.argv.slice(2));
const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });


const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
const MASTER_NODE_QUERY_INTERVAL_IN_SECONDS = 60;
const MASTER_NODE_EXPIRATION_TIME_IN_SECONDS = MASTER_NODE_QUERY_INTERVAL_IN_SECONDS * 5;

class Coordinador {

    constructor() {
        this._masterNodeKey;
        this._nodesCollection;
        this._client;

        this.initializeCoordinador();
        console.log(this._nodesCollection);
    }

    existeMaster(objectToCreate, callback) {
        this._nodesCollection.findOne({ 'master': true })
            .then((x) => {
                if (x) {
                    objectToCreate.master = false;
                } else {
                    objectToCreate.master = true;
                    this._masterNodeKey = objectToCreate.key;
                };
                console.log(x)
            })
            .then(callback(objectToCreate));
    };

    addNewNode(objectToCreate) {
        var a = this;
        objectToCreate.master = !this.existeMaster(objectToCreate,
            (x) => { a._nodesCollection.insertOne(x) });
    };

    keepAlive(OrquestadorKey) {
        this._nodesCollection.findOneAndUpdate(
            { 'key': OrquestadorKey },
            { $set: { lastUpdate: new Date() } },
            (res) => console.log(res));
    }

    initializeCoordinador() {

        mongoClient.connect()
            .then(client => {
                this._client = client;
                const collName = 'nodes';
                const db = this._client.db('kvstore');
                this._nodesCollection = db.collection(collName);
                this._nodesCollection.createIndex(
                    { 'lastUpdate': 1 },
                    { expireAfterSeconds: MASTER_NODE_EXPIRATION_TIME_IN_SECONDS }
                );
            });
    }

}

module.exports = {
    CoordinadorDeOrquestadores: Coordinador
};

app.post('/api/newNode', function (req, res) {
    let nodeDocument = {
        key: req.body.key,
        lastUpdate: new Date()
    };
    coordinador.addNewNode(nodeDocument);
    res.status(200).send(nodeDocument);
});

app.get('/api/masterNode', function (req, res) {
    res.status(200).send(coordinador._masterNodeKey);
});

app.get('/api/keepAlive', function (req, res) {
    coordinador.keepAlive(req.body.key);
    res.status(200).send("OK");
});

app.get('/api/nodes', function (req, res) {
    console.log(coordinador._nodesCollection);
    res.status(200).send("OK");
});

app.listen(3030, function () {
    console.log('Coordinador listening on port: ' + 3030);
});

const coordinador = new Coordinador();