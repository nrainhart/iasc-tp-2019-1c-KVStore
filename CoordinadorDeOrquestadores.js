const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });

const MASTER_NODE_QUERY_INTERVAL_IN_SECONDS = 60;
const MASTER_NODE_EXPIRATION_TIME_IN_SECONDS = MASTER_NODE_QUERY_INTERVAL_IN_SECONDS * 5;

class CoordinadorDeOrquestadores {

  constructor(keyDelOrquestador) {
    this._soyMaster = false;
    this._keyDelOrquestador = keyDelOrquestador;

    this.initializeMaster();
  }

  soyMaster() {
    return this._soyMaster;
  }

  initializeMaster() {
    const findOrCreate = (collection, objectToCreate) => {
      return collection.findOneAndUpdate(
        { _id: 'master node id' },
        {
          $setOnInsert: objectToCreate // updates should only happen when inserting documents
        },
        {
          returnOriginal: false, // return new doc if one is upserted
          upsert: true // insert the document if it does not exist
        }
      );
    };
    mongoClient.connect()
      .then(client => {
        const db = client.db('kvstore');
        let masterNodeCollection = db.collection('masterNode');
        masterNodeCollection.createIndex(
          { 'lastUpdate': 1 },
          { expireAfterSeconds: MASTER_NODE_EXPIRATION_TIME_IN_SECONDS }
        );
        const masterClaim = {
          currentMasterNode: this._keyDelOrquestador,
          lastUpdate: new Date()
        };
        return findOrCreate(masterNodeCollection, masterClaim)
          .then(({ value: lastInsertedObject }) => {
            const key = lastInsertedObject.currentMasterNode;
            console.log(key);
            this._soyMaster = key === this._keyDelOrquestador;
          })
          .then(() => client.close());
      });
  }

}

class CoordinadorDeOrquestadoresMockeado {
  soyMaster() {
    return true;
  }
}

module.exports = {
  CoordinadorDeOrquestadores,
  CoordinadorDeOrquestadoresMockeado
};