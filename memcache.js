var Memcache = {
	Connection:require('./connection').class	
};

// this is for easier combining of objects
// but it might interfere with other (foreign) code
// TODO replace with something less obstrusive
Object.prototype.apply = function(values) {
	for (var key in values) {
		this[key] = values[key];
	}
	return this;
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

exports.class.prototype.get = function(key, options){
	options = {}.apply(options);
	var request = {
			command:'get ' + key
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.set = function(key, value, options){
	options = {
		expires:0,
		flags:0
	}.apply(options);
	var request = {
		command:'set ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + value.length,
		data:value
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.add = function(key, value, options){
	options = {
		expires:0,
		flags:0
	}.apply(options);
	var request = {
		command:'add ' + key + ' ' + options.flags + ' ' + options.expires + ' ' + value.length,
		data:value
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.append = function(key, value, options){
	options = {}.apply(options);
	var request = {
		command:'append ' + key + ' 0 0 ' + value.length,
		data:value
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.prepend = function(key, value, options){
	options = {}.apply(options);
	var request = {
		command:'prepend ' + key + ' 0 0 ' + value.length,
		data:value
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.del = function(key, options){
	options = {}.apply(options);
	var request = {
		command:'delete ' + key
	};
	if (options.callback) request.callback = options.callback;
	this.getConnection().processRequest(request);
};

exports.class.prototype.shutdown = function(){
	if (this.connection) this.connection.close();
};