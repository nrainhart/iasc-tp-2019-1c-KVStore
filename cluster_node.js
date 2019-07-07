/*
* Cada clusterNode es un pto bien conocido del anillo a donde van a ir a parar los datos
es un cluster y no un solo nodo de forma que si se cae un nodo, aun asi seguimos teniendo el pto en el anillo. Cosa
que con un solo nodo no pasaria.
*/
function ClusterNode (clusterName) { //TODO: aca se le deberia pasar la lista de las ips de los nodos correspondientes a este cluster
    this.memory = new Map(); 
    this.clusterName = clusterName
}

ClusterNode.prototype.name = function(){
	return this.clusterName;
}

/*
*TODO: Esto deberia buscar contra la lista de nodos de datos correspondientes a este cluster, ahora lo guarda
en memoria pero pq solo es un primer acercamiento
*/
ClusterNode.prototype.find = function(key) {
    this.showEntries();
    return this.memory.get(key);
};

/*
*TODO: Esto deberia guardar contra la lista de nodos de datos correspondientes a este cluster, ahora lo guarda
en memoria pero pq solo es un primer acercamiento
*/
ClusterNode.prototype.save = function(key, value) {
    this.memory.set(key, value);
    this.showEntries();
};

ClusterNode.prototype.showEntries = function() { //TODO: esto esta a modo de log debug para poder ir visualizando donde se guarda cada key, despues habria que sacarlo
    console.log(this.memory);
};

module.exports = ClusterNode;