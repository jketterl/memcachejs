var Memcache = {};

Memcache.Request = function(config){
	if (config) this.apply(config);
};

Memcache.Request.prototype.setConnection = function(connection){
	this.connection = connection;
};

Memcache.Request.prototype.parseResponse = function(data){
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
				// unknown response string
			    // TODO: this should be passed to the client somehow
			    console.warn('unexpected: "' + command + '" on command "' + this.command + '"');
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
                pos = data.length;
            }
            /*
			var chunk = data.substr(0, this.expectedLength);
			this.expectedLength -= chunk.length;
			if (this.data) {
				this.data += chunk;
			} else {
				this.data = chunk;
			}
			if (chunk.length < data.length) {
				data = data.substr(chunk.length +2, data.length - chunk.length - 2);
				delete this.dataMode;
			} else {
				data = '';
			}
			*/
		}
	}
};

Memcache.Request.prototype.finish = function(status){
    clearTimeout(this.timeout);
	this.success = status != 'ERROR' && status != 'NOT_FOUND' && status != 'NOT_STORED';
	this.connection.finishRequest(this);
    if (this.callback) this.callback(this);
};

Memcache.Request.prototype.startTimer = function(){
    var me = this;
    this.timeout = setTimeout(function(){
        me.finish('TIMEOUT');
    }, 5000);
};

module.exports = Memcache.Request;