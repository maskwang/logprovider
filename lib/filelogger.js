var fs = require('fs'),
	path = require('path'),
	logprovider = require('./logprovider'),
	cache = {};

// Create dir if not exist
var mkdir = function(dir, mode, callback) {
	fs.exists(dir, function(exists) {
		if (exists) {
			callback(0);
		} else {
			var parentdir = path.dirname(dir);
			if( parentdir ) {
				// Create parent dir first. Then create this dir.
				mkdir(parentdir, mode, function() {
					fs.mkdir(dir, mode, callback);
				});
			}else{
				fs.mkdir(dir, mode, callback);
			}
		}
	});
};

exports.compile = function(options) {
	var formatFile = logprovider.compileFmt(options.file);
	var formatMessage = logprovider.compileFmt(options.line);
	return function(severity, msg) {
		var file = formatFile(severity);
		var line = formatMessage(severity, msg);
		if( file && line  ) {
			mkdir(path.dirname(file), '0777', function(err){
				if(err) {
					//TODO. How to know if failed to save log file.
				}else {
					fs.appendFile(file, line+'\r\n', function (err) {});
				}
			});
		}
	};
};