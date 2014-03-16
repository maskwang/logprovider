var logprovider = require('./logprovider');

exports.compile = function(options) {
	var formatMessage = logprovider.compileFmt(options.line);
	return function(severity, msg) {
		if( console.logger && console.logger[severity] ) {
			console.logger[severity](formatMessage(severity,msg));
		}
	};
};