function Node (key, value){
		this.key = key;
		this.value = value;
}
	
Node.prototype.getKey = function(){
	return this.key;
}

Node.prototype.getValue = function(){
	return this.value;
}

module.exports = Node;