const { MongoClient } = require('mongodb');
const mongoUrl = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUrl, { useNewUrlParser: true });

class CoordinadorDeOrquestadores {

  constructor(keyDelOrquestador) {
    this._soyMaster = false;
    this._keyDelOrquestador = keyDelOrquestador;
  }

  soyMaster() {
    return this._soyMaster;
  }

  initializeMaster() {
    const findOrCreate = (collection, key, value) => {
      return collection.findOneAndUpdate(
        { _id: 'master node id' },
        {
          $setOnInsert: { key: value } // updates should only happen when inserting documents
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
        return findOrCreate(masterNodeCollection, 'currentMasterNode', this._keyDelOrquestador)
          .then(({ value: { key } }) => {
            console.log(key);
            this._soyMaster = key === this._keyDelOrquestador;
          })
          .then(() => client.close());
      });
  }
}

module.exports = {
  CoordinadorDeOrquestadores
};