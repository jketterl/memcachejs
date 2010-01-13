var Memcache = {
	Connection:require('./connection').class	
};

exports.class = function(host, port){
	this.host = host ? host : 'localhost';
	this.port = port ? port : 11211;
};

exports.class.prototype.getConnection = function(){
	if (!this.connection) {
		this.connection = new Memcache.Connection(this.host, this.port);
	}
	return this.connection;
};

exports.class.prototype.get = function(key, callback){
	this.getConnection().processRequest({
		command:'get ' + key,
		callback:callback
	});
};

exports.class.prototype.shutdown = function(){
	if (this.connection) this.connection.close();
};