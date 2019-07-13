const request = require('request-promise');


/*
* Cada clusterNode es un pto bien conocido del anillo a donde van a ir a parar los datos
es un cluster y no un solo nodo de forma que si se cae un nodo, aun asi seguimos teniendo el pto en el anillo. Cosa
que con un solo nodo no pasaria.
*/
function ClusterNode (clusterName, dataNodes) { //TODO: aca se le deberia pasar la lista de las ips de los nodos correspondientes a este cluster
    //------Deprecado-------//
    this.memory = new Map(); 
    //----------------------//
    this.clusterName = clusterName;
    console.log("dataNodes: " + dataNodes);
    this.dataNodes = dataNodes;
}

ClusterNode.prototype.name = function(){
	return this.clusterName;
}

/*
*TODO: Esto deberia buscar contra la lista de nodos de datos correspondientes a este cluster, ahora lo guarda
en memoria pero pq solo es un primer acercamiento
*/

//------Deprecado-------//
ClusterNode.prototype.find = function(key) {
    this.showEntries();
    return this.memory.get(key);
};

ClusterNode.prototype.findRest = function(key) {
    const requests = this.dataNodes.map(dataNode => this.getKeyFromOneDataNode(key, dataNode));
    return Promise.all(requests)
    .then((values) => {
        let valorMasNuevo = this.valorMasReciente(values);
        console.log("valor mas nuevo: " + valorMasNuevo);
        return valorMasNuevo;
    });
    //.catch(/* handle error */);
};

ClusterNode.prototype.valorMasReciente = function(shots) {
    return shots.reduce((max, shot) => max && max.timestamp > shot.timestamp ? max : shot, null);
}

ClusterNode.prototype.getKeyFromOneDataNode = function(key, dataNode) {
    return request({
        "method":"GET", 
        "uri": dataNode + "/obtener" + "?key=" + key,
      });
}

/*
*TODO: Esto deberia guardar contra la lista de nodos de datos correspondientes a este cluster, ahora lo guarda
en memoria pero pq solo es un primer acercamiento
*/

//------Deprecado-------//
ClusterNode.prototype.save = function(key, value) {
    this.memory.set(key, value);
    this.showEntries();
};

ClusterNode.prototype.saveRest = function(key, value) { //TODO: hacer algo similar a lo del promise.all para guardar en todos los nodos del cluster
    const requests = this.dataNodes.map(dataNode => this.saveKeyOnOneDataNode(key, value, dataNode));
    return Promise.all(requests)
      .then((values) => {
          let valorMasNuevo = this.valorMasReciente(values);
          console.log("valor mas nuevo: " + valorMasNuevo);
          return valorMasNuevo;
      });
    //.catch(/* handle error */);
};

ClusterNode.prototype.saveKeyOnOneDataNode = function(key, value, dataNode) {
    return request({
        method: 'POST',
        uri: dataNode + '/guardar',
        body: {
            key: key,
            value: value
        },
        json: true // Automatically stringifies the body to JSON
    });
}

ClusterNode.prototype.showEntries = function() { //TODO: esto esta a modo de log debug para poder ir visualizando donde se guarda cada key, despues habria que sacarlo
    console.log(this.memory);
};

module.exports = ClusterNode;