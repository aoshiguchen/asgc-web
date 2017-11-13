var server = {};

var fs = require('fs');
var http = require('http');
var URL = require('url');
var querystring = require('querystring');
var util = require('./util');
var ejs = require('ejs');
var log4js = require('log4js');
var logger = log4js.getLogger('asgcjs');

var defineAction = function(name,callback){

  actions[name] = callback;

  if(name.substr(0,1) == '/'){
  	mapping[name] = name;
  }

};

var startup = function(webapps){

	logger.info('启动服务...');

	webapps.forEach(function(webapp){
		try{
			startWebapp(webapp);
		}catch(e){
			logger.error('启动失败',e);
		}
		
	});

};

var initBaseServer = function(webapp){
	if(!webapp.server){
		webapp.server = {};
	}

	if(!webapp.server.mapping){
		webapp.server.mapping = {};
	}

	if(!webapp.server.base){
	 	webapp.server.base = {};
	}

	if(!webapp.server.actions){
	 	webapp.server.actions = [];
	}

	webapp.server.base.defineAction = function(name,callback){

	  webapp.server.actions[name] = callback;
	  // logger.info(name,callback);
	  // logger.info(webapp.server.actions[name])

	  if(name.substr(0,1) == '/'){
	  	webapp.server.mapping[name] = name;
	  }

	};

	asgcjs.server = webapp.server.base;

}

var loadActionFiles = function(webapp){
	webapp.actionFiles.forEach(function(file){
		logger.info('file:',file);
		initBaseServer(webapp);
		require(file.path);

		if(webapp.config.autoload){
			fs.watch(file.path,(function(path){

				return function(){
					try{
						logger.info('reload:' + require.resolve(path));
						delete require.cache[require.resolve(path)];
						
						initBaseServer(webapp);
						require(path);
					}catch(e){

					}
				};

			})(file.path));
		}

	});
};

var loadMappingConfig = function(webapp){

	if(!webapp.server){
		webapp.server = {};
	}
	
	if(!webapp.server.mapping){
		webapp.server.mapping = {};
	}
	
	webapp.config.mapping.forEach(function(mapping){

		if(mapping.action){
			webapp.server.mapping[mapping.url] = mapping.action;
		}else if(mapping.resource){
			webapp.server.mapping[mapping.url] = webapp.path + '/' + webapp.config.view + mapping.resource;
		}

	});
}

var loadDefaultMapping = function(webapp){
	webapp.viewFiles.forEach(function(file){

		if(!(/\/view\/WEB-INF\//.test(file.path))){
			var path = file.path;
			var index = path.indexOf('/view');
			var url = path.substr(index + ('/view').length);
			console.log('path',path,'url',url,'webappName',webapp.name,'index',index,'baseurl',webapp.config.baseUrl)

			if(url.indexOf('/WEB-INF/') != 0){
				webapp.server.mapping[url] = path;
			}

		}

	});
}

var createServer = function(webapp){

	logger.info(webapp);

	var app = http.createServer(function(request, response) {

		var context = {};
		context.webapp = webapp;

		var url = request.url;
		var req = util.parseRequest(request,webapp.config.baseUrl);

		if(!req){
			return;
		}

		var simpleUrl = getSimpleUrl(request);
		var target = webapp.server.mapping[simpleUrl.url];

		logger.info('url:',request.url);
		logger.info('req:',req);
		logger.info('target:',target);

		// 如果url为 http://ip:port/proj 格式时,或者路由不存在
		// 默认访问/index、/index.html

		if(req.url == '' || req.url == '/'){
			if(webapp.server.actions['/index']){
				execAction.call(context,request, response,'/index');
			}else if(webapp.server.mapping['/index.html']){
				renderView(request, response,'/index.html');
			}else{
				returnError(404,request,response);
			}
			return;
		}

		if(!target){
			returnError(404,request,response);
			return;
		}

		if(/\.html$/.test(target) || /\.js$/.test(target) || /\.css$/.test(target)){
			doView.call(context,request,response);
		}else{
			doAction.call(context,request,response);
		}

	});

	var getSimpleUrl = function(request){
		var req = util.parseRequest(request,webapp.config.baseUrl);
		var actionRequestSuffix = webapp.config.actionRequestSuffix;

		if(req.url.length > actionRequestSuffix.length){

			var suffix = req.url.substr(req.url.length - actionRequestSuffix.length);

			if(suffix == actionRequestSuffix){
				return {
					url: req.url.substr(0,req.url.length - actionRequestSuffix.length),
					suffix: suffix
				};
			}
		}

		return {
			url: req.url,
			suffix: ''
		};
	}

	var doAction = function(request,response){

		var req = util.parseRequest(request,webapp.config.baseUrl);
		var actionRequestSuffix = webapp.config.actionRequestSuffix;

		if(req.url.length > actionRequestSuffix.length){

			var suffix = req.url.substr(req.url.length - actionRequestSuffix.length);

			if(suffix == actionRequestSuffix){
				
				var url = req.url.substr(0,req.url.length - actionRequestSuffix.length);
				execAction.call(this,request,response,url);
				
			}else{
				returnError(404,request,response);
			}

		}
		
	};

	var doParams = function(request,callback){
		var method = request.method.toLowerCase();
		var params = {};

		logger.info('method:' + method);

		if(method == 'get'){
			params = URL.parse(request.url,true).query;
			logger.info('params:', params);
			callback(params);
		}else if(method == 'post'){
			var body = '';
		    request.on('data', function (data) {
		         body += data;
		    });
      		request.on('end', function () {
        		var result = querystring.parse(body);
				callback(result);
      		});
		    	
		}
	}

	var execAction = function(request,response,url){
		var actionName = webapp.server.mapping[url];
		var action = webapp.server.actions[actionName];
		// console.log(actionName)
		// console.log(action)
		// 
		var context = this;
 
	  	if(actionName && action){
	  		doParams(request,function(params){
	  			var result = action.call(context,request,response,params);
	  			var resultType = typeof result;
		  		var contentType = 'text/plain;charset=utf-8';
		  		var data;

		  		logger.info('action return data:',result);

		  		var modelAndView = parseModelAndView(result);
		  		if(modelAndView){
		  			toModelAndView.call(context,request,response,modelAndView);
		  			return;
		  		}

		  		switch(resultType){
		  			case 'string':
		  				data = result;
		  				renderData(request,response,data);
		  				break;
		  			case 'number':
		  				data = result + '';
		  				response.writeHead(200, { "Content-Type": contentType });
		  				response.end(data);
		  				break;
		  			case 'boolean':
		  				data = result + '';
		  				response.writeHead(200, { "Content-Type": contentType });
		  				response.end(data);
		  				break;
		  			case 'object':
		  				contentType = 'text/json;charset=utf-8';
		  				data = JSON.stringify(result);
		  				response.writeHead(200, { "Content-Type": contentType });
		  				response.end(data);
		  				break;
		  		};
	  		});
	  	}else{
	  		returnError(404,request,response);
	  	}
	}

	app.listen(webapp.config.port);
	logger.info(ASGC.logo);
	logger.info('启动成功!','端口号:' + webapp.config.port);
}

var renderView = function(request,response,path,data){
		if(path){
			var htmlContent = util.readFile(path);

			if(data){
				htmlContent = ejs.render(htmlContent,data);
			}
			
			response.writeHead(200, { 'Content-Type': 'text/html' });
	    	response.end(htmlContent);
		}else{
			returnError(404,request,response);
		}
	}

	var doView = function(request,response){
		var context = this;

		var req = util.parseRequest(request,context.webapp.config.baseUrl);
		var path = context.webapp.server.mapping[req.url];
		
		renderView(request,response,path);
	};

var startWebapp = function(webapp){

	logger.info('startup webapp :',webapp.baseUrl);

	logger.info('loadActionFiles',webapp.actionFiles);
	loadActionFiles(webapp);

	logger.info('loadMappingConfig',webapp.config.mapping);
	loadMappingConfig(webapp); 

	logger.info('load default mapping...');
	loadDefaultMapping(webapp);

	logger.info('mapping:',webapp.server.mapping);

	logger.info('create server...');
	createServer(webapp);

}

var returnError = function(state,request,response){
	var contentType = 'text/plain';
	
	response.writeHead(200, { "Content-Type": contentType });
	response.write('404 the page not found !');
	response.end();

}

var parseModelAndView = function(data){

	var type = typeof data;

	if('string' == type){
		if(/^view:/.test(data) && data.length > 5){
			return {
				view: data.substr(5),
				data: {}
			};
		}
	}else if('object' == type){
		if(data['view']){
			return {
				view: data['view'],
				data: data['data']
			}
		}
	}

	return null;
}


var renderData = function(request,response,data){

	if(data && data.startsWith('redirect:')){
		var url = data.substr(9);
		logger.info('redirect:',url);
		redirect(response,url);
	}else{
		var contentType = 'text/plain;charset=utf-8';
		response.writeHead(200, { "Content-Type": contentType });
		response.end(data);
	}

}

var redirect = function(response,url){
	response.writeHead(301, {'Location': url});
	response.end();
}

var toModelAndView = function(request,response,modelAndView){
	var context = this;
	var path = context.webapp.path + '/' + context.webapp.config.view + modelAndView.view;
	var data = modelAndView.data;
	logger.info('path',path);

	renderView(request,response,path,data);
}

server.startup = startup;
server.startWebapp = startWebapp;

module.exports = server;