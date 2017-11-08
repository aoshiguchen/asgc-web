var asgcjs = {};
global.asgcjs = asgcjs;

var log4js = require('log4js');
var logger = null;

var util = require('./util');
var server = require('./server');
var webapp = null;

asgcjs.use = function(name){
	
	switch(name){
		case 'server':
			return asgcjs.server;
		case 'logger':
			return logger;
	}

};

function loggerConfig(logFilePath){
	log4js.configure({
	   	appenders: { 
		  	asgcjs: { 
		  		type: 'file', 
		  		filename: logFilePath,
		  		category: 'asgcjs',
			 	maxLogSize: 51200,
			 	backups: 4
		  	},
		  	console: {  
	            type: 'console',  
	            category: 'console'  
	        }
	 	},
	  	categories: { 
	  		default: { 
		  		appenders: ['asgcjs','console'], 
		  		level: 'all' 
	  		} 
	  	}
	});

	logger = log4js.getLogger('asgcjs');

	logger.info('logger configure finished.');
}

/*
{
	logger: {
		file: '../logs/system.log'
	},
	app: {
		path: '../',
		config: {
	
		}
	}
}
 */
var configure = function(json){

	var logFilePath = json.logger.file;
	loggerConfig(logFilePath);
	
	webapp = util.loadWebProject(json.app);
}

var startup = function(){

	if(!webapp){
		var path = process.cwd();
		var logFilePath = path + '/logs/system.log';
		
		loggerConfig(logFilePath);
		webapp = util.loadWebProject({
			path: path
		});
	}

	logger.info('webapp',webapp);

	server.startWebapp(webapp);
}

module.exports = {
	configure: configure,
	startup: startup
};


