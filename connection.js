var Memcache = {
		Request:require('./request').class
};
var net = require('net');
var sys = require('sys');

exports.class = function(host, port){
	this.host = host;
	this.port = port;
};

require('sys').inherits(exports.class, process.EventEmitter);

exports.class.prototype.processRequest = function(request) {
	// todo: implement some kind of queueing mechanism here
	if (this.request) return;
	this.emit('status', 'busy');
	this.request = request;
	if (!(this.request instanceof Memcache.Request)) this.request = new Memcache.Request(this.request);
	this.request.setConnection(this);
	this.getTcpConnection(function(connection){
		connection.write(request.command + '\r\n');
		if (request.data) connection.write(request.data + '\r\n');
	});
};

exports.class.prototype.isBusy = function() {
	return this.request != undefined;
};

exports.class.prototype.getTcpConnection = function(callback) {
	if (this.tcpConnection == undefined) {
		// no connection established? let's start a new one
		var connection = net.createConnection(this.port, this.host);
		if (callback) connection.addListener('connect', function(){
			callback(connection);
		});
		// ugly closure
		var method = this;
		// add event listeners
		connection.addListener('data', function(){
			method.request.parseResponse.apply(method.request, arguments);
		});
		connection.addListener('close', function(){
			method.close.apply(method, arguments);
		});
		this.tcpConnection = connection;
	} else {
		// connection already established? use this one
		if (callback) callback(this.tcpConnection);
	}
	return this.tcpConnection;
};

exports.class.prototype.close = function() {
	if (!this.tcpConnection) return;
	this.tcpConnection.end();
	delete this.tcpConnection;
	if (this.request) {
		this.request.finish('ERROR');
	}
	this.emit('close');
};

exports.class.prototype.finishRequest = function(request) {
	if (request != this.request) return;
	delete this.request;
	this.emit('status', 'idle');
};
/*
exports.class.prototype.setPool = function(pool) {
	this.pool = pool;
};

exports.class.prototype.getPool = function() {
	if (this.pool) return this.pool;
	return false;
};
*/