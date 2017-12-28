var observer = require('../observer');
var Callback = require('../callback');
var type = require('../type');
var json = require('../json');

function Service(namespace){
	if(!(this instanceof Service)){
		throw new Error('方法调用方式有误!');
	}

	this.observer = observer(namespace);
}

Service.prototype.add = function(){
	return this.observer.on.apply(null,arguments)
}

Service.prototype.test = function(){
	return this.observer.test.apply(null,arguments)
}

Service.prototype.invoke = function(){  
	return this.observer.trigger.apply(null,arguments);
}

Service.prototype.invokeOne = function(){
	return this.observer.triggerOne.apply(null,arguments);
}

Service.prototype.invokeChain = function(){
	return this.observer.triggerChain.apply(null,arguments);
}
 
Service.prototype.defineAction = function(a,b,c){

	var url,method,callback;
	url = a;
	if(type.isFunction(b) || type.isArray(b)){
		method = null;
		callback = b;
	}else{
		method = b;
		callback = c;
	}

	if(type.isArray(callback)){
		callback = new Callback(callback,['request','response','args']);
	}
 		
	if(method && method != ''){
		url += '.' + method;
	}

	if(!this.router){
		this.router = {}; 
	}
 
	if(this.router[url]){
		throw new Error('router: ' + url + ' duplicate!');
	}

	this.router[url] = url; 

	return this.observer.on(url,callback); 
}

Service.prototype.defineGetAction = function(url,callback){

	return this.defineAction(url,'GET',callback);
}

Service.prototype.definePutAction = function(url,callback){

	return this.defineAction(url,'PUT',callback);
}

Service.prototype.definePostAction = function(url,callback){

	return this.defineAction(url,'POST',callback);
}

Service.prototype.defineDeleteAction = function(url,callback){

	return this.defineAction(url,'DELETE',callback);
}

Service.prototype.http = function(url,method,req,resp,data,callback,error){
	var result;

	var parse = parseUrl(url);
	var params = json.merge(parse.params,data);
	var path = parse.path;
	var fullPath = path + '.' + method;

	var p = {
		request: req,
		response: resp,
		args: params
	};

	if(this.observer.test(fullPath)){
		result = this.observer.triggerAction(fullPath,p,req,resp,params);
	}else if((!method || 'GET' == method) && this.observer.test(path)){
		result = this.observer.triggerAction(path,p,req,resp,params);
	}else if(!method && this.observer.test(path + '.' + 'GET')){
		result = this.observer.triggerAction(path + '.' + 'GET',p,req,resp,params);
	}else{
		error && error(404);
		return 404; 
	} 

	callback && callback(result);

	return result;
}

Service.prototype.get = function(url,req,resp,data,callback,error){
	return this.http(url,'GET',req,resp,data,callback,error);
}

Service.prototype.post = function(url,req,resp,data,callback,error){
	return this.http(url,'POST',req,resp,data,callback,error);
}

Service.prototype.put = function(url,req,resp,data,callback,error){
	return this.http(url,'PUT',req,resp,data,callback,error);
}

Service.prototype.delete = function(url,req,resp,data,callback,error){

	if(url){
		var index = url.indexOf('?');
		if(index != -1){
			url = url.substr(0,index);
		}
	}

	return this.http(url,'DELETE',req,resp,data,callback,error);
}

Service.prototype.testUrl = function(url){
	return this.test(url) || this.test(url + '.GET') || this.test(url + '.POST') || this.test(url + '.PUT') || this.test(url + '.DELETE');
}

Service.prototype.getRouter = function(){

	return this.router;
}

//解析url
var parseUrl = function(url){
	var path;
	var params = {};
	var index = url.indexOf('?');

	if(index == -1){
		return {
			path: url,
			params: params
		};
	}

	path = url.substr(0,index);

	if(url.length > index + 1){
		var paramsString = url.substr(index + 1);
		var paramList = paramsString.split('&');
	
		paramList.forEach(function(item){
			var index = item.indexOf('=');
			if(index != -1){
				var key = item.substr(0,index);
				var val = null;
				if(item.length > index + 1){
					val = item.substr(index + 1);
				}
				params[key] = val;
			}
		});
	}

	return {
		path: path,
		params: params
	};
};

module.exports = Service;


