var chain = require('../util/chain');
var file = require('../util/file');
var log4js = require('log4js');
var Service = require('../util/service');
var type = require('../util/type');
var json = require('../util/json');
var http = require('./http');
var fs = require('fs');

var server = {};
var logger;

/**
 * 启动项目
 * @param  number port 端口号 此处如果不指定，将读取配置文件，没有配置文件或者配置文件没有配置，则默认为8088
 * @param  string path 路径 默认为当前路径
 */
var startup = function(port,path){

	var loader = chain();

	loader.add(initGlobalConfig)
		  .add(loadDefaultResources)
		  .add(loadProjectFiles)
		  .add(initProjectConfig)
		  .add(initService)
		  .add(loadActions)
		  .add(loadServices)
		  .add(loadViews)
		  .add(loadProjectRouter)
		  .add(loadDefaultRouter)
		  .add(startWebapp)
		  .invoke(port,path);
}

/**
 * 初始化全局配置
 */
function initGlobalConfig(port,path){

	if(!global['ASGC']){
		require('../cli/init');
	}

	var app = {};
	app.default = {};
	app.default.config = file.getJsonByPath(ASGC.app_config_path);

	app.path = path || ASGC.work_dir;
	app.port = port; 

	app.global = {};
	app.global.mime = file.getJsonByPath(ASGC.mime_config_path);
	app.global.getFileDesc = function(path){
		if(!path) return;

		var mime = app.global.mime;

		for(var i of mime.data){
			var suffixs = i.suffix.split(',');
			for(var j of suffixs){
				if(path.toLowerCase().endsWith(j.toLowerCase())){
					return i;
				}
			}
		}

		return mime.default;
	}

	return app;
}

/**
 * 加载默认资源
 */
function loadDefaultResources(app){
	var path = ASGC.home_dir + '/pages'
	var files = file.getFileList(path);

	app.default.resources = files;
	
	return chain.doNext(arguments);
}

/**
 * 加载项目文件
 */
function loadProjectFiles(app){

	 app.files = file.getFileList(app.path);

	 app.getFile = function(description){
	 	var strArr = description.split(':');
	 	var ns = strArr[0];
	 	var relativePath = strArr[1];
	 	var files;

	 	switch(ns){
	 		case 'project': files = app.files; break;
	 		case 'pages': files = app.default.resources; break;  
	 	}

	 	for(var file of files){
	 		if(relativePath == file.relativePath){ 
	 			return file;
	 		}
	 	}

	 	return null;
	 }

	 app.getFileList = function(description,exclude){
	 	var strArr = description.split(':');
	 	var ns = strArr[0];
	 	var relativePath = strArr[1] + '/';
	 	var files;
	 	var list = [];

	 	switch(ns){
	 		case 'project': files = app.files; break;
	 		case 'pages': files = app.default.resources; break;  
	 	}

	 	for(var file of files){
	 		if(file.relativePath.startsWith(relativePath) && (!exclude || (exclude && !file.relativePath.startsWith(exclude)))){ 
	 			list.push(file);
	 		}
	 	}

	 	return list;
	 }

	return chain.doNext(arguments);
}

/**
 * 初始化项目配置
 */
function initProjectConfig(app){

	//初始化项目配置
	var appJsonFile = app.getFile('project:/app.json');
	var appConfigPath = appJsonFile ? appJsonFile.path : null;

	//如果项目没有配置，则采用默认配置
	//否则，取默认配置与项目配置的并集，相同的配置项优先采用项目配置
	if(!appConfigPath){
		app.config = app.default.config;
	}else{
		 var config = file.getJsonByPath(appConfigPath);
		 app.config = json.merge(app.default.config,config);
	}

	app.config.port = app.port || app.config.port;
	
	app.baseUrl = 'http://localhost:' + app.config.port;

	if(app.config.project){
		app.baseUrl += '/' + app.config.project;
	}

	//初始化日志配置
	var logConfigPath = app.getFile('project:/log4js.json');

	if(!logConfigPath){
		app.logConfig = {
		   	appenders: { 
			  	asgcjs: { 
			  		type: 'file', 
			  		filename: ASGC.work_dir + '/logs/system.log',
			  		category: 'asgc',
				 	maxLogSize: 51200,
				 	backups: 5
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
		};
	}else{
		app.logConfig = file.getJsonByPath(logConfigPath);
	}

	return chain.doNext(arguments);
}

/**
 * 初始化服务
 */
function initService(app){

 	log4js.configure(app.logConfig);
 	logger= log4js.getLogger('asgc');

 	logger.info('initService ...');
 	logger.info('init logger');

 	app.logger = logger;

 	logger.info('init server');
 	app.server = {};
 	app.server._ = {};

 	var action = new Service('action');
 	var service = new Service('service');

 	app.server._.action = action;
 	app.server._.service = service;
 	app.server._.log4js = log4js;

 	app.server.defineAction = function(name,other1,other2){

 		action.defineAction.apply(action,arguments);
 	};

 	app.server.defineService = function(name,callback){
 		service.add(name,callback);
 	};

 	app.server.invoke = function(){
 		return service.invoke.apply(service,arguments); 
 	}; 

	/**
	 * 根据名称引用框架内置服务，如：server、logger、mysql、等等
	 * @param  string name 引用名称
	 * @return object      服务对象
	 */
	server.getService = function(name){

		switch(name){
			case 'server': 
				return app.server;
			case 'logger':
				return app.logger;
		}
	}

	logger.info('initService finished.');

	return chain.doNext(arguments);
}

/**
 * 加载action
 */
function loadActions(app){

	logger.info('loadActions ...');

	app.actionFiles = app.getFileList('project:/' + app.config.actionFloder);
	
	app.actionFiles.forEach(function(file){ 
		logger.info('load ' + file.path);
		require(file.path); 

		//热部署支持
		if(app.config.autoload){
			fs.watch(file.path,(function(path){
				return function(){
					try{
						logger.info('reload:' + require.resolve(path));
						//delete require.cache[require.resolve(path)];
						
						require(path);
					}catch(e){
						logger.error('reload error :',e);
					}
				};
			})(file.path));
		}
	}); 

	logger.info('loadActions finished.');

	return chain.doNext(arguments);
}

/**
 * 加载service
 */
function loadServices(app){

	logger.info('loadServices ...');

	app.serviceFiles = app.getFileList('project:/' + app.config.serviceFloder);
	
	app.serviceFiles.forEach(function(file){ 
		logger.info('load ' + file.path);
		require(file.path); 
	}); 

	logger.info('loadServices finished.');

	return chain.doNext(arguments);
}

/**
 * 加载view
 */
function loadViews(app){
	logger.info('loadViews ...');

	app.viewFiles = {};

	app.viewFiles.base = app.getFileList('project:/' + app.config.viewFloder,'/' + app.config.viewFloder + '/WEB-INF/');
	app.viewFiles.web_inf = app.getFileList('project:/' + app.config.viewFloder + '/WEB-INF');

	app.viewFiles.base.forEach(function(file){
		logger.info('load ' + file.path);
	});

	app.viewFiles.web_inf.forEach(function(file){
		logger.info('load ' + file.path);
	});

	logger.info('loadViews finished.');

	return chain.doNext(arguments);
}

/**
 * 加载项目路由
 */
function loadProjectRouter(app){ 
	logger.info('loadProjectRouter ...');

	//加载action路由
	app.router = app.server._.action.getRouter() || []; 

	//加载配置文件路由
	var mapping = app.config.mapping;
	mapping.forEach(function(mapping){
		if(mapping.action){
			app.router[mapping.url] = mapping.action;
		}else if(mapping.resource){
			app.router[mapping.url] = mapping.resource;
		}
	});
 
	logger.info('loadProjectRouter finished.');

	return chain.doNext(arguments);
}

/**
 * 加载默认路由
 */
function loadDefaultRouter(app){
	logger.info('loadDefaultRouter ...');

	//加载pages路由
	app.default.resources.forEach(function(file){
		app.router['/_pages' + file.relativePath] = file.path;
	});

	//view目录下的文件自动路由（如果已经存在路由，则跳过），WEB-INF下除外
	app.viewFiles.base.forEach(function(file){
		var url = file.relativePath.substr(app.config.viewFloder.length + 1);
		app.router[url] = file.path;
	});

	//当router中没有/路由时
	//如果存在/index、index、/index.html，则默认映射为/
	if(!app.router['/']){
		if(app.server._.action.testUrl('/index')){
			app.router['/'] = '/index';
		}else if(app.server._.action.testUrl('index')){ 
			app.router['/'] = 'index';
		}else if(app.router['/index.html']){
			app.router['/'] = '/index.html';
		}
	}

	app.router['/favicon.ico'] = app.getFile('pages:/favicon.ico').path;

	logger.info('loadDefaultRouter finished.');
 
	for(var key in app.router){
		logger.info('router:',key,app.router[key]);
	}

	return chain.doNext(arguments);
}

/**
 * 启动服务
 */ 
function startWebapp(app){
	logger.info('startWebapp ...');

	http.create(app);

	logger.info('startWebapp finished.');

	logger.info(ASGC.logo);
	logger.info('启动成功!',app.baseUrl);

}

server.startup = startup;

module.exports = server;