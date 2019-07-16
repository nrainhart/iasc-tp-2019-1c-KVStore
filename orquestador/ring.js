const ConsistentHashing = require('consistent-hashing');
const ClusterNode = require('./cluster_node');

/*
*TODO: estos clusters se deberian ir inicializando cuando se lea del mongo los nodos de datos o a medida que los nodos de datos 
le notifiquen al master que ya estan up (queda por definir...)
*/

//==========================================================================//
//===Ojo para que esto funcione es necesario levantar estos nodos a mano!!!====
//==========================================================================// 
const clusterNode1 = new ClusterNode("clusterNode1", ["http://localhost:8050/nodoDatos", "http://localhost:8051/nodoDatos"]);  

//const clusterNode2 = new ClusterNode("clusterNode2");
//const clusterNode3 = new ClusterNode("clusterNode3");

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

//Esta función podrá no estar delegada, y estar directamente en el ring.
findFilteredValuesInClusterNodes = function(cond, value){
    return Promise.all(clusterNodes.map(clusterNode => clusterNode.todosLosValoresDelClusterQueCumplanLaCondicion(cond, value)))
    .then(resultadosPorCluster => resultadosPorCluster.flat());
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
        },

        delete: function(key){
            const clusterNode = findClusterNode(key);
            return clusterNode.deleteRest(key);
        },

        findFilteredValues: function(cond, value){
        	const clusterNodeValores = findFilteredValuesInClusterNodes(cond, value);
            return clusterNodeValores;
        }
    }
};