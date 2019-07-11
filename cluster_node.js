const request = require('request-promise');


/*
* Cada clusterNode es un pto bien conocido del anillo a donde van a ir a parar los datos
es un cluster y no un solo nodo de forma que si se cae un nodo, aun asi seguimos teniendo el pto en el anillo. Cosa
que con un solo nodo no pasaria.
*/
function ClusterNode (clusterName, dataNodeAddress) { //TODO: aca se le deberia pasar la lista de las ips de los nodos correspondientes a este cluster
    //------Deprecado-------//
    this.memory = new Map(); 
    //----------------------//
    this.clusterName = clusterName;
    this.dataNodeAddress = dataNodeAddress;
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
    let response = this.doRequest(key);
    console.log("respuesta del nodo de datos: " + response);
    return response;
};


ClusterNode.prototype.doRequest = function(key) {
    return request({
        "method":"GET", 
        "uri": this.dataNodeAddress + "/obtener" + "?key=" + key,
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

ClusterNode.prototype.saveRest = function(key, value) {
    return request({
        method: 'POST',
        uri: this.dataNodeAddress + "/guardar",
        body: {
            key: key,
            value: value
        },
        json: true // Automatically stringifies the body to JSON
    });
};

ClusterNode.prototype.showEntries = function() { //TODO: esto esta a modo de log debug para poder ir visualizando donde se guarda cada key, despues habria que sacarlo
    console.log(this.memory);
};

module.exports = ClusterNode;