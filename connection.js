var Memcache = {
    Request:require('./request')
};
var net = require('net');
var sys = require('sys');

Memcache.Connection = function(host, port){
    this.host = host;
    this.port = port;

    this.requestQ = [];
};

sys.inherits(Memcache.Connection, process.EventEmitter);

Memcache.Connection.prototype.processRequest = function(request) {
    //if already busy, then push on to the request queue
    if (this.isBusy()) {
        this.requestQ.push(request);
        return;
    }

    this.emit('status', 'busy');
    this.request = request;
    if (!(this.request instanceof Memcache.Request)) this.request = new Memcache.Request(this.request);
    this.request.setConnection(this);
	this.getTcpConnection(function(connection){
	    var command = request.command + '\r\n';
		if (request.data) command += request.data + '\r\n';
		connection.write(command);
	});
};

Memcache.Connection.prototype.isBusy = function() {
    return this.request != undefined;
};

Memcache.Connection.prototype.getTcpConnection = function(callback) {
    if (this.tcpConnection == undefined) {
        // no connection established? let's start a new one
        var connection = net.createConnection(this.port, this.host);
        if (callback) connection.addListener('connect', function(){
            callback(connection);
        });
        
        var me = this;
        // add event listeners
        connection.addListener('data', function(){
            me.request.parseResponse.apply(me.request, arguments);
        });
        connection.addListener('close', function(){
            me.close.apply(me, arguments);
        });
        this.tcpConnection = connection;
    } else {
        // connection already established? use this one
        if (callback) callback(this.tcpConnection);
    }
    return this.tcpConnection;
};

Memcache.Connection.prototype.close = function() {
    if (!this.tcpConnection) return;
    this.tcpConnection.end();
    delete this.tcpConnection;
    if (this.request) {
        this.request.finish('ERROR');
    }
    this.emit('close');
};

Memcache.Connection.prototype.finishRequest = function(request) {
    if (request != this.request) return;
    delete this.request;
    this.emit('status', 'idle');

    //if there are requests waiting, then process the next one
    if(this.requestQ.length > 0) {
        this.processRequest(this.requestQ.shift());
    }
};
/*
Memcache.Connection.prototype.setPool = function(pool) {
    this.pool = pool;
};

Memcache.Connection.prototype.getPool = function() {
    if (this.pool) return this.pool;
    return false;
};
*/

module.exports = Memcache.Connection;