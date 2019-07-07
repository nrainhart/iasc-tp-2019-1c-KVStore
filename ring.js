const ConsistentHashing = require('consistent-hashing');
const ClusterNode = require('./cluster_node');

/*
*TODO: estos clusters se deberian ir inicializando cuando se lea del mongo los nodos de datos o a medida que los nodos de datos 
le notifiquen al master que ya estan up (queda por definir...)
*/
var clusterNode1 = new ClusterNode();  
var clusterNode2 = new ClusterNode();
var clusterNode3 = new ClusterNode();

clusterNode1.save("clusterNode1", "clusterNode1");
clusterNode2.save("clusterNode2", "clusterNode2");
clusterNode3.save("clusterNode3", "clusterNode3");

const consistentHashing = new ConsistentHashing([clusterNode1, clusterNode2, clusterNode3]);

findClusterNode = function (key) {
    return consistentHashing.getNode(key);
}

module.exports = {
    ring: {

        find: function(key) {
            const clusterNode = findClusterNode(key);
            return clusterNode.find(key);
        },

        save: function(key, value) {
            const clusterNode = findClusterNode(key);
            clusterNode.save(key, value);
        }
    }
};

