var Memcache = require('./memcache');

var exports = module.exports = function(options){
	// default settings
	Memcache.apply(this, {
		maxConnections:10,
		host:'localhost',
		port:11211,
		pool:[]
	});
	// user-specified settings
	if (options) Memcache.apply(this, options);
	// start a queue
	this.queue = [];
};

exports.prototype = {
    getConnection:function(){
    	for (var i = 0; i < this.pool.length; i++) {
    		if (!this.pool[i].isBusy()) return this.pool[i];
    	}
    	if (this.pool.length < this.maxConnections) {
    		var connection = new Memcache.Connection(this.host, this.port);
    		this.addConnection(connection);
    		return connection;
    	}
    	return false;
    },
    addConnection:function(connection){
    	var me = this;
    	connection.addListener('status', function(status) {
    		if (status == 'idle') me.processQueue(connection);
    	});
    	connection.addListener('close', function() {
    		me.removeConnection(connection);
    	});
    	this.pool.push(connection);
    },
    removeConnection:function(connection){
    	for (var i = 0; i < this.pool.length; i++){
    		if (this.pool[i] == connection) {
    			this.pool.splice(i, 1);
    			//TODO this should be more specific, i.e. include a second parameter
    			//connection.removeListener('status');
    			//connection.removeListener('close');
    		}
    	}
    },
    processQueue:function(connection) {
    	if (this.queue.length == 0) return;
    	if (connection && !connection.isBusy()) {
    		connection.processRequest(this.queue.pop());
    		return;
    	}
    	connection = this.getConnection();
    	if (connection) connection.processRequest(this.queue.pop());
    },
    processRequest:function(request) {
    	this.queue.push(request);
    	this.processQueue();
    },
    close:function(){
        for (var i = this.pool.length - 1; i >= 0; i--) {
            this.pool[i].close();
        }
    }
};