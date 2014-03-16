
module.exports = {
	providers : {
		filelogger : {
			provider : './filelogger',
			options : {
				file : '/var/log/fda/{{new Date().Format("yy-MM-dd")}}-{{severity}}.txt',
				line : '{{new Date().Format("yy/MM/dd hh:mm:ss")}} {{msg}}'
			}
		},
		
		consolelogger : {
			provider : './consolelogger',
			options : {
				line : '{{new Date().Format("yy/MM/dd hh:mm:ss")}} {{msg}}'
			}
		}
	},

	loggers : {
		log : ['filelogger', 'consolelogger'],
		info : ['filelogger', 'consolelogger'],
		warn : ['filelogger', 'consolelogger'],
		debug : ['consolelogger'],
		error : ['filelogger', 'consolelogger'],
		fatal : ['filelogger', 'consolelogger']
	}
};