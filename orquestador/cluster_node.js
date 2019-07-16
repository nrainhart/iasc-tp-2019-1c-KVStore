const request = require('request-promise');
const promiseAllAlways = require('promise-all-always');

/*
* Cada clusterNode es un pto bien conocido del anillo a donde van a ir a parar los datos
es un cluster y no un solo nodo de forma que si se cae un nodo, aun asi seguimos teniendo el pto en el anillo. Cosa
que con un solo nodo no pasaria.
*/
function ClusterNode (clusterName, dataNodes) { //TODO: aca se le deberia pasar la lista de las ips de los nodos correspondientes a este cluster
  this.clusterName = clusterName;
  console.log("dataNodes: " + dataNodes);
  this.dataNodes = dataNodes;
}

ClusterNode.prototype.name = function(){
  return this.clusterName;
};

ClusterNode.prototype.findRest = function(key) {
  const requests = this.dataNodes.map(dataNode => this.getKeyFromOneDataNode(key, dataNode));
  return this.allResolved(requests)
    .then((successfulValues) => {
      let valorMasNuevo = this.valorMasReciente(successfulValues);
      console.log('valor mas nuevo: ' + valorMasNuevo.value);
      return valorMasNuevo;
    })
    .catch(() => {
      let mensajeDeError = `Valor no encontrado para clave [${key}]`;
      console.log(mensajeDeError);
      throw Error(mensajeDeError);
    }); // TODO podría ser más granular (nodo de datos lleno, no hay nodos de datos, etc)
};

ClusterNode.prototype.todosLosValoresDelClusterQueCumplanLaCondicion = function(cond, value){
    const requests = this.dataNodes.map(dataNode => this.getKeyFromOneDataNode(key, dataNode)); 
    //No se me ocurre una forma copada para obtener las keys de los todos los Nodos del cluster. 
    return this.allResolved(requests)
      .then((successfulValues) =>{
        let valorMasNuevo = this.valorMasReciente(successfulValues);
        return valorMasNuevo.filter(valor => this.cumpleCondicion(cond, value, valor))
      })
}

ClusterNode.prototype.cumpleCondicion = function(cond, value, valor) {
 if(cond == 'Mayor'){
    return valor > value
    } else {
    return  valor < value
    }
}

ClusterNode.prototype.allResolved = function(promises) {
  return promiseAllAlways(promises)
    .then((values) => {
      const successfulValues = values.filter(value => value.isResolved)
        .map(value => value.result);
      if(successfulValues.length > 0) {
        return successfulValues;
      } else {
        throw Error("Todas las promises rejectearon");
      }
    });
};

ClusterNode.prototype.valorMasReciente = function(shots) {
  var entryWithLatestTimestamp = null;
  shots.forEach(element => {
      elementJson =  JSON.parse(element);
      if (!entryWithLatestTimestamp || entryWithLatestTimestamp.timestamp < elementJson.timestamp)
          entryWithLatestTimestamp = elementJson;
  });
  return entryWithLatestTimestamp;
};

ClusterNode.prototype.getKeyFromOneDataNode = function(key, dataNode) {
  return request({
    "method":"GET",
    "uri": dataNode + "/obtener" + "?key=" + key,
  });
};

ClusterNode.prototype.removeKeyFromOneDataNode = function(key, dataNode) {
  return request({
    "method":"DELETE",
    "uri": dataNode + "/quitar" + "?key=" + key,
  });
};

ClusterNode.prototype.getValueFromOneDataNode = function(key, dataNode) {
  return request({
    "method":"GET",
    "uri": dataNode + "/obtenerValor" + "?key=" + key,
  });
};

ClusterNode.prototype.saveRest = function(key, value) {
  const requests = this.dataNodes.map(dataNode => this.saveKeyOnOneDataNode(key, value, dataNode));
  return this.allResolved(requests)
    .then((successfulValues) => {
      const escriturasExitosas = successfulValues.length;
      const cantidadDeNodosDeDatos = requests.length;
      console.log(`Se pudo almacenar el par(${key},${value}) en (${escriturasExitosas}/${cantidadDeNodosDeDatos}) nodos del cluster de datos`);
    })
    .catch(() => {
      let mensajeDeError = `No se pudo almacenar el par(${key},${value}) en el cluster de datos`;
      console.log(mensajeDeError);
      throw Error(mensajeDeError);
    });
};

ClusterNode.prototype.saveKeyOnOneDataNode = function(key, value, dataNode) {
  console.log(`Guardando en ${dataNode}`);
  return request({
    method: 'POST',
    uri: dataNode + '/guardar',
    body: {
      key: key,
      value: value
    },
    json: true // Automatically stringifies the body to JSON
  });
};

module.exports = ClusterNode;