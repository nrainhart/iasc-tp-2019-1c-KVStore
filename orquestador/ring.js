const ConsistentHashing = require('consistent-hashing');
const ClusterNode = require('./cluster_node');

function closedNumberRange(start, end) {
    return new Array(end - start + 1).fill().map((d, i) => i + start);
};

function chunk(array, size) {
    return Array.from({length: Math.ceil(array.length / size)}, (v, i) =>
        array.slice(i * size, i * size + size)
    );
}

class HashRing {

    constructor(clusters, replicas, initialDataNodePort, finalDataNodePort) {
        const dataNodeIPs = closedNumberRange(initialDataNodePort, finalDataNodePort)
            .map(port => `http://localhost:${port}/nodoDatos`);
        const dataNodeIPsForEachCluster = chunk(dataNodeIPs, replicas);

        this.clusterNodes = closedNumberRange(1, clusters)
            .map(clusterNumber => "clusterNode" + clusterNumber)
            .map((clusterNodeName, index) => new ClusterNode(clusterNodeName, dataNodeIPsForEachCluster[index]));
        const clusterNames = this.clusterNodes.map(clusterNode => clusterNode.name());
        this.consistentHashing = new ConsistentHashing(clusterNames);
        setInterval(() => this.healthCheckClusters(), 1000);
    };

    find(key) {
        const clusterNode = this.findClusterNode(key);
        return clusterNode.findRest(key);
    };

    save(key, value) {
        const clusterNode = this.findClusterNode(key);
        return clusterNode.saveRest(key, value);
    };

    delete(key) {
        const clusterNode = this.findClusterNode(key);
        return clusterNode.deleteRest(key);
    };

    findFilteredValues(cond, value) {
        const clusterNodeValores = this.findFilteredValuesInClusterNodes(cond, value);
        return clusterNodeValores;
    };

    //Esta función podrá no estar delegada, y estar directamente en el ring.
    findFilteredValuesInClusterNodes(cond, value) {
    return Promise.all(this.clusterNodes.map(clusterNode => clusterNode.todosLosValoresDelClusterQueCumplanLaCondicion(cond, value)))
    .then(resultadosPorCluster => resultadosPorCluster.flat());
    };

    findClusterNode(key) {
        const clusterName = this.consistentHashing.getNode(key);
        console.log(`La clave [${key}] pertenece al cluster ${clusterName}`);
        return this.clusterNodes.find(clusterNode => clusterNode.name() === clusterName);
    }

    healthCheckClusters() {
        this.clusterNodes.forEach(clusterNode => clusterNode.healthCheckNodosDeDatos());
    }
}

module.exports = HashRing;

