var exports = module.exports = function(host, port){
	this.host = host ? host : 'localhost';
	this.port = port ? port : 11211;
};

exports.pooling = true;

exports.apply = function(target, values){
    for (var key in values) {
        target[key] = values[key];
    }
    return target;
};

exports.apply(exports, {
    Connection:require('./connection'),
    Pool:require('./pool'),
    Request:require('./request'),
    prototype:{
        getConnection:function(){
        	if (!this.connection) {
        		this.connection = new exports.Connection(this.host, this.port);
        	}
        	return this.connection;
        	return this.getPool().getConnection();
        },
        processRequest:function(request){
        	if (exports.pooling) {
        		return this.getPool().processRequest(request);
        	} else {
        		return this.getConnection().processRequest(request);
        	}
        },
        getPool:function(){
        	if (!this.pool) {
        		this.pool = new exports.Pool({
        			host:this.host,
        			port:this.port
        		});
        	}
        	return this.pool;
        },
        get:function(key, callback){
        	var request = {
        			command:'get ' + key
        	};
        	if (callback) request.callback = callback;
        	this.processRequest(request);
        },
        set:function(key, value, options){
        	options = exports.apply({
        		expires:0,
        		flags:0
        	}, options);
        	value = new Buffer(value);
        	var request = {
        		command:'set ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + value.length,
        		data:value
        	};
        	if (options.callback) request.callback = options.callback;
        	this.processRequest(request);
        },
        add:function(key, value, options){
        	options = exports.apply({
        		expires:0,
        		flags:0
        	}, options);
        	var request = {
        		command:'add ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + Buffer.byteLength(value),
        		data:value
        	};
        	if (options.callback) request.callback = options.callback;
        	this.processRequest(request);
        },
        append:function(key, value, options){
        	options = exports.apply({}, options);
        	var request = {
        		command:'append ' + key + ' 0 0 ' + Buffer.byteLength(value),
        		data:value
        	};
        	if (options.callback) request.callback = options.callback;
        	this.processRequest(request);
        },
        prepend:function(key, value, options){
        	options = exports.apply({}, options);
        	var request = {
        		command:'prepend ' + key + ' 0 0 ' + Buffer.byteLength(value),
        		data:value
        	};
        	if (options.callback) request.callback = options.callback;
        	this.processRequest(request);
        },
        del:function(key, options){
        	options = exports.apply({}, options);
        	var request = {
        		command:'delete ' + key
        	};
        	if (options.callback) request.callback = options.callback;
        	this.processRequest(request);
        },
        shutdown:function(){
            var obj = (exports.pooling ? this.pool : this.connection);
            if (obj) obj.close();
        }
    }
});