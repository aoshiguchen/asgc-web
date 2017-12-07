var chain = require('../util/chain');
var http = require('http');
var file = require('../util/file');
var url = require('../util/url');
var ejs = require('ejs');

var logger;

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

		loader.add(requestParse)
		      .add(requestDispatch)
			  .invoke(request,response,context);

	});

	app.http.server.listen(app.config.port);
}

/**
 * 请求解析
 */
function requestParse(req,resp,context){
	logger.info('requestParse ...',req.url);
 	
 	var project = context.app.config.project;
 	var actionRequestSuffix = context.app.config.actionRequestSuffix;

 	if(req.url == '/favicon.ico'){
 		context.req = {};
 		context.req.url = req.url;
 		return chain.doStop(doView(req,resp,context));
 	}

	if(!!project && !req.url.startsWith('/' + project)){
		return chain.doStop(returnError(404,req,resp,context)); 
	}

	context.suffix = actionRequestSuffix;
	context.req = {};

	context.req.url = project?req.url.substr(project.length + 1) : req.url;

	//TODO POST参数
	context.req.url = context.req.url || '/';
	var ret = url.parse(context.req.url);
	context.req.url = ret.path;
	context.req.params = ret.params;
	context.req.suffix = ret.suffix;
	context.req.method = req.method;

	if(context.req.url != '/' && context.suffix){
		if(context.suffix != context.req.suffix){
			context.req.type = 'resource';
		}else{
			context.req.type = 'action';
		}
	}

	if(!context.req.type){
		if(context.req.suffix == '.html'){
			context.req.type = 'resource';
		}
	}

	if(!context.req.type){ 
		var actionService = context.app.server._.action;
		if(actionService.testUrl(context.req.url)){
			context.req.type = 'action';
		}else{
			context.req.type = 'resource';
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


	if('resource' == context.req.type){
		doView(req,resp,context);
	}else if('action' == context.req.type){
		doAction(req,resp,context);
	}
}

//=========================================================================================================
// 以上是请求链处理，下面是完成实际功能的一些工具函数
//=========================================================================================================
/**
 * 视图处理
 */
function doView(req,resp,context){
	logger.info('doView:',context.req.url);

	try{
		renderView(req,resp,context,context.app.router[context.req.url],context.req.params);
	}catch(e){
		logger.error('doView Error !',e);
	}
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

	var modelAndView = parseModelAndView(result);
	if(modelAndView){
		toModelAndView(req,resp,context,modelAndView);
		return;
	}

	switch(resultType){
		case 'string':
			data = result;
			renderData(req,resp,context,data);
			break;
		case 'number':
			data = result + '';
			resp.writeHead(200, { "Content-Type": contentType });
			resp.end(data);
			break;
		case 'boolean':
			data = result + '';
			resp.writeHead(200, { "Content-Type": contentType });
			resp.end(data);
			break;
		case 'object':
			contentType = 'text/json;charset=utf-8';
			data = JSON.stringify(result);
			resp.writeHead(200, { "Content-Type": contentType });
			resp.end(data);
			break;
	};

}

function renderData(req,resp,context,data){

	logger.info('renderData:',data); 

	if(data && data.startsWith('redirect:')){
		var url = data.substr(9);
		logger.info('redirect:',url);
		redirect(url,req,resp,context);
	}else if(data && data.startsWith('forward:')){
		var url = data.substr(8);
		logger.info('forward:',url);
		forword(url,req,resp,context);
	}else{
		var contentType = 'text/plain;charset=utf-8';
		resp.writeHead(200, { "Content-Type": contentType });
		resp.end(data);
	}

}

/**
 * 视图渲染
 */
function renderView(req,resp,context,path,data){
	logger.info('renderView:',path);

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
}

/**
 * 返回错误页面
 */
function returnError(state,req,resp,context){
	
	if(404 == state){
		return404(req,resp,context);
	}
	
}

/**
 * 返回404页面 
 */
function return404(req,resp,context){

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
	requestDispatch(req,resp,context);
}

function parseModelAndView(data){
	logger.info('parseModelAndView:',data);

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

function toModelAndView(req,resp,context,modelAndView){
	logger.info('toModelAndView:',modelAndView.data);
	
	var path = modelAndView.view;
	var data = modelAndView.data;
	logger.info('path',path);

	renderView(req,resp,context,path,data);
}

module.exports = {
	create: create
};
