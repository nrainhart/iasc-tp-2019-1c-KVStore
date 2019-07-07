const ConsistentHashing = require('consistent-hashing');
const ClusterNode = require('./cluster_node');

/*
*TODO: estos clusters se deberian ir inicializando cuando se lea del mongo los nodos de datos o a medida que los nodos de datos 
le notifiquen al master que ya estan up (queda por definir...)
*/
var clusterNode1 = new ClusterNode();  
var clusterNode2 = new ClusterNode();
var clusterNode3 = new ClusterNode();

//esto solo lo usamos para interpretar de manera sencilla en el log a que clusterNode corresponde el dato guardado o leido.
clusterNode1.save("clusterNode1", "clusterNode1");
clusterNode2.save("clusterNode2", "clusterNode2");
clusterNode3.save("clusterNode3", "clusterNode3");

const consistentHashing = new ConsistentHashing(["clusterNode1", "clusterNode2", "clusterNode3"]);

findClusterNode = function (key) {
    return consistentHashing.getNode(key);
}

getClusterNodeByName = function (name) {
    if (name === "clusterNode1") {
        return clusterNode1;
    };
    if (name === "clusterNode2") {
        return clusterNode2;
    };
    if (name === "clusterNode3") {
        return clusterNode3;
    };
}

module.exports = {
    ring: {

        find: function(key) {
            const clusterName = findClusterNode(key);
            const clusterNode = getClusterNodeByName(clusterName);
            return clusterNode.find(key);
        },

        save: function(key, value) {
            const clusterName = findClusterNode(key);
            const clusterNode = getClusterNodeByName(clusterName);
            clusterNode.save(key, value);
        }
    }
};

