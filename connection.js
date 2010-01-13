exports.class = function(host, port){
	this.host = host;
	this.port = port;
};

var Memcache = {
		Request:require('./request').class
};
var tcp = require('tcp');

exports.class.prototype.processRequest = function(request) {
	// todo: implement some kind of queueing mechanism here
	if (this.request) return;
	this.request = request;
	if (!(this.request instanceof Memcache.Request)) this.request = new Memcache.Request(request);
	this.request.setConnection(this);
};