var chain = require('../util/treeChain');
var http = require('http');
var file = require('../util/file');
var url = require('../util/url');
var ejs = require('ejs');
var querystring = require('querystring');
var json = require('../util/json');

var logger;
var loader;

/**
 * 创建一个http服务
 */
var create = function(app){

	logger = app.logger;

	logger.info('create server ...');
	 
	app.http = {};
	app.http.server = http.createServer(function(request, response) {

		var context = {};
		context.app = app;

		loader = chain();
		loader.setRoot(requestParse)
				  .set(requestParse).child(requestDispatch).end()
				  .set(requestDispatch).child('resource',doView)
				  					   .child('action',doAction).end()
				  .set(doView).child(renderView).end()
				  .set(doAction).child('string',renderString)
				  				.child('number',renderNumber)
				  				.child('boolean',renderBoolean)
				  				.child('object',renderObject).end()
				  .set(renderString).child('view',renderView).end()
				  .set(renderObject).child('json',renderJson)
				  					.child('view',renderView).end();

		var body = '';
	    request.on('data', function (data) {
	         body += data;
	    });
  		request.on('end', function () {
    		var result = querystring.parse(body); 
			context.postdata = result;
			
			loader.invoke(request,response,context);
  		});

		

	});

	app.http.server.listen(app.config.port);
}

/**
 * 请求解析
 */
function requestParse(req,resp,context){
	logger.info('requestParse ...',req.url);
 	
 	var project = context.app.config.project;
 	var actionRequestSuffix = context.app.config.actionRequestSuffix || '';

 	if(req.url == '/favicon.ico'){
 		context.req = {};
 		context.req.url = req.url;
 		return chain.doStop(doView(req,resp,context));
 	}

	if(!!project && !req.url.startsWith('/' + project)){
		return chain.doStop(returnError(404,req,resp,context)); 
	}

	logger.info('parse url',req.url);

	context.suffix = actionRequestSuffix.toLowerCase();
	context.req = {};

	context.req.url = project?req.url.substr(project.length + 1) : req.url;

	context.req.url = context.req.url || '/';
	var ret = url.parse(context.req.url);
	context.req.url = ret.path;
	context.req.params = json.merge(ret.params,context.postdata);
	context.req.suffix = ret.suffix?ret.suffix.toLowerCase():'';
	context.req.method = ret.method?ret.method.toUpperCase():'';

	logger.info('parse req type...');

	if(context.req.url != '/' && context.suffix){
		logger.info('by actionRequestSuffix:',context.suffix);
		if(context.suffix != context.req.suffix){
			context.req.type = 'resource';
		}else{
			context.req.type = 'action';
		}
	}

	if(!context.req.type){
		logger.info('by url suffix:',context.req.suffix);
		if(context.req.suffix == '.html'){
			context.req.type = 'resource';
		}
	}

	if(!context.req.type){ 
		var actionService = context.app.server._.action;
		logger.info('by action:',context.req.url,actionService.testUrl(context.req.url));
		if(actionService.testUrl(context.req.url)){
			context.req.type = 'action';
		}else{
			logger.info('by action:',context.req.url,actionService.testUrl(context.app.router[context.req.url]));
			if(actionService.testUrl(context.app.router[context.req.url])){
				context.req.type = 'action';
				context.req.url = context.app.router[context.req.url];
			}else{
				context.req.type = 'resource';
			}
		}
	}

	if('resource' == context.req.type){
		context.req.url += context.req.suffix;
	}

	logger.info('req:',context.req);

	return chain.doNext(arguments);
}

/**
 * 请求调度
 */
function requestDispatch(req,resp,context){
	logger.info('requestDispatch ...');

	return chain.doNext(context.req.type,[req,resp,context]);
}


/**
 * 视图处理
 */
function doView(req,resp,context){
	logger.info('doView:',context.req.url);

	return chain.doNext([req,resp,context,context.app.router[context.req.url],context.req.params]);
	
}

/**
 * 控制器处理
 */
function doAction(req,resp,context){
	var service = context.app.server._.action;
	var url = context.req.url;
	var method = context.req.method;
	var params = context.req.params;

	logger.info('doAction:',method,url,params); 

	var result = service.http(url,method,req,resp,params); 
	var resultType = typeof result;
 
	var contentType = 'text/plain;charset=utf-8';
	var data;

	logger.info('action return data:',result);

	logger.info('data type:',resultType);

	return chain.doNext(resultType,[req,resp,context,result]);
}

function renderString(req,resp,context,data){

	logger.info('renderString:',data); 

	if(data && data.startsWith('redirect:')){
		var url = data.substr(9);
		logger.info('redirect:',url);
		redirect(url,req,resp,context);
	}else if(data && data.startsWith('forward:')){
		var url = data.substr(8);
		logger.info('forward:',url);
		forword(url,req,resp,context);
	}else{
		if(/^view:/.test(data) && data.length > 5){
			return chain.doNext('view',[req,resp,context,data.substr(5),{}]);
		}else{
			var contentType = 'text/plain;charset=utf-8';
			resp.writeHead(200, { "Content-Type": contentType });
			resp.end(data);
		}
	}

	return chain.doStop();
}

function renderNumber(req,resp,context,data){
	logger.info('renderNumber:',data); 

	var contentType = 'text/plain;charset=utf-8';
	resp.writeHead(200, { "Content-Type": contentType });
	resp.end(data + '');
}

function renderBoolean(req,resp,context,data){
	logger.info('renderBoolean:',data); 

	var contentType = 'text/plain;charset=utf-8';
	resp.writeHead(200, { "Content-Type": contentType });
	resp.end(data + '');
}

function renderObject(req,resp,context,data){
	logger.info('renderObject:',data); 

	if(data.view){
		return chain.doNext('view',[req,resp,context,data.view,data.data]);
	}else{
		return chain.doNext('json',arguments);
	}

}

function renderJson(req,resp,context,data){
	logger.info('renderJson:',data);

	contentType = 'text/json;charset=utf-8';
	data = JSON.stringify(data);
	resp.writeHead(200, { "Content-Type": contentType });
	resp.end(data);
}


/**
 * 视图渲染
 */
function renderView(req,resp,context,path,data){
	logger.info('renderView:',path);

	try{
		if(path){

			var content;
			var mime = context.app.global.getFileDesc(path);

			try{
				content = file.read(path,mime.type);
			}catch(e){ 
				try{
					logger.info('renderView:',ASGC.work_dir + '/' + context.app.config.viewFloder + path);
					content = file.read(ASGC.work_dir + '/' + context.app.config.viewFloder + path,mime.type);
				}catch(e){
					return returnError(404,req,resp,context);
				}
			}

			if(mime.type == 'text' && data){
				content = ejs.render(content,data);
			}

			resp.writeHead(200, { 'Content-Type': mime.mime });
	    	resp.end(content);
		}else{
			returnError(404,req,resp,context);
		}
	}catch(e){
		logger.error('renderView Error !',e);
	}
}

/**
 * 返回错误页面
 */
function returnError(state,req,resp,context){
	logger.info('returnError',state);
	
	if(404 == state){
		return404(req,resp,context);
	}
	
}

/**
 * 返回404页面 
 */
function return404(req,resp,context){

	if(!context.req){
		context.req = {};
		context.req.url = req.url;	
	}

	logger.info(context.req.url,404);

	var url = context.app.baseUrl + '/_pages/404.html';
	redirect(url,req,resp,context);
	
}

/**
 * 重定向
 */
function redirect(url,req,resp,context){
	logger.info('redirect:',url);

	resp.writeHead(302, {'Location': url});
	resp.end();
}

/**
 * 请求转发
 */
function forword(url,req,resp,context){ 
	logger.info('forword:',url);

	if(!context.req){
		context.req = {};
		context.req.type = 'resource';
	}
	

	context.req.url = url;

	loader.execute(requestDispatch,req,resp,context);

}

module.exports = {
	create: create
};
