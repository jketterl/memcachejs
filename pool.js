var Memcache = {
	Connection:require('./connection').class
};

exports.class = function(options){
	// default settings
	this.apply({
		maxConnections:10,
		host:'localhost',
		port:11211,
		pool:[]
	});
	// user-specified settings
	if (options) this.apply(options);
};

exports.class.prototype.getConnection = function(){
	for (var i = 0; i < this.pool.length; i++) {
		if (!this.pool[i].isBusy()) return this.pool[i];
	}
	if (this.pool.length < this.maxConnections) {
		var connection = new Memcache.Connection(this.hos, this.port);
		this.pool.push(connection);
		require('sys').puts('# of connections is now: ' + this.pool.length);
		return connection;
	}
	require('sys').puts('unable to open additional connections - max # of connections reached');
	return false;
};