var Memcache = require('./memcache');

var exports = module.exports = function(config){
	if (config) Memcache.apply(this, config);
};

exports.prototype = {
    setConnection:function(connection){
    	this.connection = connection;
    },
    parseResponse:function(data){
        if (!Buffer.isBuffer(data)) throw new Error('Buffer object expected!');
        var pos = 0;
        while (pos < data.length) {
    		if (!this.dataMode) {
    		    var command = '';
    		    while (command.indexOf('\r\n') < 0 && pos < data.length) {
    		        command += data.slice(pos, ++pos);
    		    }
    		    command = command.slice(0, command.length -2);
    			if (command.substring(0, 5) == 'VALUE') {
    			    this.dataMode = true;
    				var split = command.split(' ');
    				this.expectedLength = parseInt(split[3]);
    			} else if (command == 'END' || command == 'ERROR' || command == 'STORED' || command == 'DELETED' || command == 'NOT_FOUND' || command == 'NOT_STORED') {
    				this.finish(command);
    			} else {
    			    this.finish('UNEXPECTED');
    			}
    		} else {
                this.data = this.data || '';
                if (data.length - pos > this.expectedLength) {
                    this.data += data.slice(pos, pos + this.expectedLength);
                    // data is followed by \r\n - we can skip that.
                    pos += this.expectedLength + 2;
                    delete(this.dataMode);
                } else {
                    this.data += data.slice(pos);
                    this.expectedLength -= data.length - pos;
                    pos = data.length;
                }
    		}
    	}
    },
    finish:function(status){
        clearTimeout(this.timeout);
    	this.success = status != 'ERROR' && status != 'NOT_FOUND' && status != 'NOT_STORED' && status != 'TIMEOUT' && status != 'UNEXPECTED';
    	this.connection.finishRequest(this);
        if (this.callback) this.callback(this);
    },
    startTimer:function(){
        var me = this;
        this.timeout = setTimeout(function(){
            me.finish('TIMEOUT');
        }, 5000);
    }
};