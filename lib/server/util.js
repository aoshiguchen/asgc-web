var fs = require('fs');
var URL = require('url');
var querystring = require('querystring');
var serverConfig = null;

var getServerConfig = function(){

	if(!serverConfig){
		serverConfig = {
			defaultPort: 8088,
			defaultActionFloder: "action",
			defaultModelFloder: "model",
			defaultViewFloder: "view",
			defaultProject: "root",
			defaultAutoLoad: false,
		}
	}

	return serverConfig;
};

//递归遍历文件
var getFileList = function(path){

	var fileList = [];

	ergodicFile(path,fileList);

	return fileList;	
};

//获取子文件夹
var getChildDirectorys = function(path){

	var fileList = [];

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(states.isDirectory()){

			var obj = {};
			obj.name = file;
			obj.path = path + '/' + file;
			fileList.push(obj);

		}

	});

	return fileList;

};

var loadWebappConfig = function(path){

	var config = {};

	var serverConfig = getServerConfig();

	if(fs.existsSync(path)){
		var data = fs.readFileSync(path,'utf-8');
		config = JSON.parse(data);
	}else{
		return null;
	}

	if(!config.port){
		config.port = serverConfig.defaultPort;
	}

	if(!config.action){
		config.action = serverConfig.defaultActionFloder;
	}

	if(!config.model){
		config.model = serverConfig.defaultModelFloder;
	} 

	if(!config.view){
		config.view = serverConfig.defaultViewFloder;
	}

	if(!config.project){
		config.project = serverConfig.defaultProject;
		config.baseUrl = '';
	}else{

		if(config.project.toLowerCase() == serverConfig.defaultProject){
			config.baseUrl = '';
		}else{
			config.baseUrl = '/' + config.project;
		}
		
	}

	if(!config.actionRequestSuffix){
		config.actionRequestSuffix = '';
	}

	if(!config.autoload){
		config.autoload = serverConfig.defaultAutoLoad;
	}

	if(!config.mapping){
		config.mapping = [];
	}

	return config;
};

//加载webapp
var loadWebapp = function(webapp){

	var config = loadWebappConfig(webapp.path + '/app.json');

	if(!config){
		return null;
	}

	var actionFiles = getFileList(webapp.path + '/' + config.action);
	var modelFiles = getFileList(webapp.path + '/' + config.model);
	var viewFiles = getFileList(webapp.path + '/' + config.view);

	webapp.config = config;
	webapp.actionFiles = actionFiles;
	webapp.modelFiles = modelFiles;
	webapp.viewFiles = viewFiles;

	var url = 'http://localhost:' + config.port + '/';

	if(config.project.toLowerCase() != serverConfig.defaultProject){

		url += webapp.config.project + '/';

	}

	webapp.baseUrl = url;

	return webapp;
};

var getProjectConfig = function(config){
	var serverConfig = getServerConfig();

	if(!config.port){
		config.port = serverConfig.defaultPort;
	}

	if(!config.action){
		config.action = serverConfig.defaultActionFloder;
	}

	if(!config.model){
		config.model = serverConfig.defaultModelFloder;
	} 

	if(!config.view){
		config.view = serverConfig.defaultViewFloder;
	}

	if(!config.project){
		config.project = serverConfig.defaultProject;
		config.baseUrl = '';
	}else{

		if(config.project.toLowerCase() == serverConfig.defaultProject){
			config.baseUrl = '';
		}else{
			config.baseUrl = '/' + config.project;
		}
		
	}

	if(!config.actionRequestSuffix){
		config.actionRequestSuffix = '';
	}

	if(!config.autoload){
		config.autoload = serverConfig.defaultAutoLoad;
	}

	if(!config.mapping){
		config.mapping = [];
	}

	return config;
}

var loadWebProject = function(json){

	if(!json.config){
		json.config = {};
	}

	var config = getProjectConfig(json.config);
	var path = json.path;
	var webapp = {};

	if(!config){
		return null;
	}

	var actionFiles = getFileList(path + '/' + config.action);
	var modelFiles = getFileList(path + '/' + config.model);
	var viewFiles = getFileList(path + '/' + config.view);

	webapp.path = path;
	webapp.config = config;
	webapp.actionFiles = actionFiles;
	webapp.modelFiles = modelFiles;
	webapp.viewFiles = viewFiles;

	var url = 'http://localhost:' + config.port + '/';

	if(config.project.toLowerCase() != serverConfig.defaultProject){

		url += config.project + '/';

	}

	webapp.baseUrl = url;

	return webapp;
}

//获取所有的webapp
var getWebapps = function (){

	var serverConfig = getServerConfig();

	var webapps = [];
	var paths = ['../webapps'];

	if(serverConfig.projectFloders){
		for(var i in serverConfig.projectFloders){
			paths.push(serverConfig.projectFloders[i])
		}
	}

	paths.forEach(function(path){
		var files = getChildDirectorys(path);
		files.forEach(function(file){
			var webapp = loadWebapp(file);

			if(webapp){
				webapps.push(webapp);
			}
		});
	});

	return webapps;
};

//递归遍历文件
var ergodicFile = function(path,fileList){

	if(!fs.existsSync(path)){
		return;
	}

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(states.isDirectory()){

			ergodicFile(path + '/' + file,fileList);

		}else{
			var obj = {};
			obj.size = states.size;
			obj.name = file;
			obj.path = path + '/' + file;
			fileList.push(obj);

		}

	});

};

//获取子文件
var getChildFiles = function(path){

	var fileList = [];

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(!states.isDirectory()){

			var obj = {};
			obj.size = states.size;
			obj.name = file;
			obj.path = path + '/' + file;
			fileList.push(obj);

		}

	});

	return fileList;
};

//读取文件内容
var readFile = function(path,encode){

	if(!encode){
		encode = 'utf-8';
	}

	var data = fs.readFileSync(path,encode);

	return data;

};

//解析url
var parseUrl = function(url){

	var path = url;
	var params = {};
	var index = url.indexOf('?');

	if(index != -1){
		path = url.substr(0,index);
	}

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

var getParamsByRequest = function(request){

	var method = request.method.toLowerCase();

	if(method == 'get'){
		return URL.parse(request.url, true).query;
	}

	return {};
}

//解析request
var parseRequest = function(request,baseUrl){

	if(request.url.indexOf(baseUrl) != 0){
		return null;
	}

	var url = parseUrl(request.url.substr(baseUrl.length));

	return {
		url: url.path,
		params: url.params
	};

};

module.exports = {
	getFileList: getFileList,
	readFile: readFile,
	getChildFiles: getChildFiles,
	parseUrl: parseUrl,
	parseRequest: parseRequest,
	getChildDirectorys: getChildDirectorys,
	getWebapps: getWebapps,
	getParamsByRequest: getParamsByRequest,
	loadWebProject: loadWebProject
};