var settings = require('../cfg/settings'),
	loggers = {};

exports.onStart = function() {
	// Save default logger address.
	console.logger = {
		log : console.log,
		info : console.info,
		warn : console.warn,
		error : console.error
	};
	
	// Init new loggers
	var cache = {};
	for( var severity in settings.loggers) {
		// Iterate all provider names on severity.
		for(var i in settings.loggers[severity]) {
			var providerName = settings.loggers[severity][i];
			var provider = cache[providerName];
			if(!provider) {
				var cfg = settings.providers[providerName];
				if(!cfg) {
					console.error('Failed To Find Provider : ', providerName);
					continue;
				}
				
				var module = require(cfg.provider);
				provider = module.compile(cfg.options);
				if( !provider )
					continue;
				
				cache[providerName] = provider;
			}
			if(!loggers[severity]) {
				loggers[severity] = [];
			}
			loggers[severity].push(provider);
		}
	}
	
	// Define root logger
	var rootLogger = function(severity, arguments) {
		var msgs = [];
		for( var i in arguments ) {
			if(arguments[i])
				msgs.push(arguments[i].toString());
		}
		var msg = msgs.join(' ');
		
		if( loggers[severity] ) {
			for( var i in loggers[severity] ) {
				loggers[severity][i](severity, msg);
			}
		}
	};
	
	// Override console log implementation.
	for( var severity in settings.loggers ) {
		(function (severity) {
			console[severity] = function() {
				rootLogger(severity, arguments);
			};
		})(severity);
	}
	
	// Support date Date().Format(fmt)
	if(!Date.prototype.Format) {
		Date.prototype.Format = function(fmt)
	    {
	        var o = {
	            "M+" : this.getMonth()+1,                 //月份
	            "d+" : this.getDate(),                    //日
	            "h+" : this.getHours(),                   //小时
	            "m+" : this.getMinutes(),                 //分
	            "s+" : this.getSeconds(),                 //秒
	            "q+" : Math.floor((this.getMonth()+3)/3), //季度
	            "S"  : this.getMilliseconds()             //毫秒
	        };
	        if(/(y+)/.test(fmt))
	            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	        for(var k in o)
	            if(new RegExp("("+ k +")").test(fmt))
	                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	        return fmt;
	    };
	}
	
	return true;
};

exports.compileFmt = function(code) {
	var fmts = [];
	var index = 0;
	code.replace(/{{(.*?)}}/g, function(m, value, i, str) {
		if(i>index) {
			fmts.push(str.substr(index,i-index));
		}
		index = i+m.length;
		fmts.push(new Function('severity, msg', 'return '+value+';'));
	});
	if( index<code.length ) {
		fmts.push(code.substr(index));
	}
	return function(severity, message){
		var line = '';
		for(var i in fmts) {
			if( toString.call(fmts[i]) === '[object String]' ) {
				line += fmts[i];
			}else {
				line += fmts[i](severity, message);
			}
		}
		return line;
	};
};