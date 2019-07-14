const ConsistentHashing = require('consistent-hashing');
const ClusterNode = require('./cluster_node');

/*
*TODO: estos clusters se deberian ir inicializando cuando se lea del mongo los nodos de datos o a medida que los nodos de datos 
le notifiquen al master que ya estan up (queda por definir...)
*/

//==========================================================================//
//===Ojo para que esto funcione es necesario levantar estos nodos a mano!!!====
//==========================================================================// 
var clusterNode1 = new ClusterNode("clusterNode1", ["http://localhost:8050/nodoDatos", "http://localhost:8051/nodoDatos"]);  

//var clusterNode2 = new ClusterNode("clusterNode2");
//var clusterNode3 = new ClusterNode("clusterNode3");

//esto solo lo usamos para interpretar de manera sencilla en el log a que clusterNode corresponde el dato guardado o leido.
clusterNode1.saveRest("clusterNode1", "clusterNode1");
//clusterNode2.save("clusterNode2", "clusterNode2");
//clusterNode3.save("clusterNode3", "clusterNode3");

const clusterNodes = [clusterNode1];//, clusterNode2]//, clusterNode3];

const clusterNames = clusterNodes.map(clusterNode => clusterNode.name());

const consistentHashing = new ConsistentHashing(clusterNames);


findClusterNode = function (key) {
    const clusterName = consistentHashing.getNode(key);
    console.log(`La clave [${key}] pertenece al cluster ${clusterName}`);
    return clusterNodes.find(clusterNode => clusterNode.name() === clusterName);
};

module.exports = {
    ring: {

        find: function(key) {
            const clusterNode = findClusterNode(key);
            return clusterNode.findRest(key);
        },

        save: function(key, value) {
            const clusterNode = findClusterNode(key);
            return clusterNode.saveRest(key, value);
        }
    }
};
