const request = require('request-promise');
const promiseAllAlways = require('promise-all-always');

/*
* Cada clusterNode es un pto bien conocido del anillo a donde van a ir a parar los datos
es un cluster y no un solo nodo de forma que si se cae un nodo, aun asi seguimos teniendo el pto en el anillo. Cosa
que con un solo nodo no pasaria.
*/

function ClusterNode (clusterName, dataNodes) {
  this.clusterName = clusterName;
  this.log("dataNodes: " , dataNodes);
  this.dataNodes = new Set(dataNodes);
  this.nodosMuertos = new Set();
};

ClusterNode.prototype.name = function(){
  return this.clusterName;
};

ClusterNode.prototype.findRest = function(key) {
  const requests = [];
  this.dataNodes.forEach(dataNode => requests.push(this.getKeyFromOneDataNode(key, dataNode)));
  return this.allResolved(requests)
    .then((successfulValues) => {
      let valorMasNuevo = this.valorMasReciente(successfulValues);
      this.log(`valor mas nuevo: ${valorMasNuevo.value}`);
      return valorMasNuevo;
    })
    .catch(() => {
      let mensajeDeError = `Valor no encontrado para clave [${key}]`;
      this.log(mensajeDeError);
      throw Error(mensajeDeError);
    }); // TODO podría ser más granular (nodo de datos lleno, no hay nodos de datos, etc)
};

ClusterNode.prototype.todosLosValoresDelClusterQueCumplanLaCondicion = function(cond, value){
    const requests = [];
    this.dataNodes.forEach(dataNode => requests.push(this.getFilteredValuesFromOneDataNode(cond,value, dataNode)));
    return this.allResolved(requests)
      .then((successfulValues) =>{
        this.log("valores encontrados al buscar por rango: ", successfulValues);
        let resultadosFiltrados = successfulValues[0];
        return resultadosFiltrados;
      })
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
    "method":`GET`,
    "uri": `${dataNode}/obtener?key=${key}`
  });
};

ClusterNode.prototype.removeKeyFromOneDataNode = function(key, dataNode) {
  return request({
    "method":"DELETE",
    "uri": `${dataNode}/quitar?key=${key}`,
  });
};

ClusterNode.prototype.getValueFromOneDataNode = function(key, dataNode) {
  return request({
    "method":"GET",
    "uri": dataNode + "/obtenerValor" + "?key=" + key,
  });
};

ClusterNode.prototype.getFilteredValuesFromOneDataNode = function(cond, value, dataNode) {
  return request({
    "method":"GET",
    "uri": dataNode + "/filtroPorCondicion" + "?condicion=" + cond + "&valor=" + value,
  });
};

ClusterNode.prototype.saveRest = function(key, value) {
  const requests = [];
  this.dataNodes.forEach(dataNode => requests.push(this.saveKeyOnOneDataNode(key, value, dataNode)));
  return this.allResolved(requests)
    .then((successfulValues) => {
      const escriturasExitosas = successfulValues.length;
      const cantidadDeNodosDeDatos = requests.length;
      this.log(`Se pudo almacenar el par(${key},${value}) en (${escriturasExitosas}/${cantidadDeNodosDeDatos}) nodos del cluster de datos`);
    })
    .catch(() => {
      let mensajeDeError = `No se pudo almacenar el par(${key},${value}) en el cluster de datos`;
      this.log(mensajeDeError);
      throw Error(mensajeDeError);
    });
};

ClusterNode.prototype.deleteRest = function(key) {
  const requests = [];
  this.dataNodes.forEach(dataNode => requests.push(this.removeKeyFromOneDataNode(key, dataNode)));
  return this.allResolved(requests)
    .then((successfulValues) => {
      const borradosExitosos = successfulValues.length;
      const cantidadDeNodosDeDatos = requests.length;
      this.log(`Se pudo quitar la clave(${key}) en (${borradosExitosos}/${cantidadDeNodosDeDatos}) nodos del cluster de datos`);
    })
    .catch(() => {
      let mensajeDeError = `No se pudo borrar la clave(${key}) en el cluster de datos`;
      this.log(mensajeDeError);
      throw Error(mensajeDeError);
    });
};

ClusterNode.prototype.saveKeyOnOneDataNode = function(key, value, dataNode) {
  this.log(`Guardando en ${dataNode}`);
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

ClusterNode.prototype.healthCheckNodosDeDatos = function() {
  this.dataNodes.forEach(dataNode => this.updatearMuerto(dataNode))
  this.nodosMuertos.forEach(nodoMuerto => this.updatearRevivido(nodoMuerto))
};

ClusterNode.prototype.updatearMuerto = function(dataNode) {
  this.callHealthCheck(dataNode)
    .catch((error) => {
      //this.log("Error: " , error.error , ", el nodo: " , dataNode , " esta muerto")
      this.log("El nodo: " , dataNode , " esta muerto")
      this.sacarNodoMuerto(dataNode)
    });
};

ClusterNode.prototype.updatearRevivido = function(dataNode) {
  this.callHealthCheck(dataNode)
    .then((res) => {
        this.log(`el nodo ${dataNode} revivio, la respuesta es: ${res}`);
        this.agregarNodoRevivido(dataNode);
    })
    .catch(()=> this.log("El nodo ", dataNode, " sigue muerto"));
};

ClusterNode.prototype.callHealthCheck = function(dataNode) {
  return request({
    "method":"GET",
    "uri": dataNode + "/health-check" 
  });
};

ClusterNode.prototype.sacarNodoMuerto = function(nodoMuerto) {
  this.dataNodes.delete(nodoMuerto);
  this.nodosMuertos.add(nodoMuerto);
  this.log("nodos muertos: " , this.nodosMuertos);
};

ClusterNode.prototype.agregarNodoRevivido = function(nodoRevivido) {
  this.nodosMuertos.delete(nodoRevivido);
  this.dataNodes.add(nodoRevivido);
  this.log("nodos vivos: " , this.dataNodes);
};

ClusterNode.prototype.log = function(...logMessage) {
  console.log("[" , this.clusterName , "]=> ", logMessage);
};

module.exports = ClusterNode;