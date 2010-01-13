exports.class = function(config){
	this.config = config;
};

exports.class.prototype.setConnection = function(connection){
	this.connection = connection;
};