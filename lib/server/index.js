var asgc = {};
global.asgc = asgc;

var server = require('./server');

/**
 * 根据名称引用框架内置服务，如：server、logger、mysql、等等
 * @param  string name 引用名称
 * @return object      服务对象
 */
asgc.use = function(name){
	
	return server.getService(name);
};

/**
 * 启动项目
 * @param  number port 端口号 此处如果不指定，将读取配置文件，没有配置文件或者配置文件没有配置，则默认为8088
 * @param  string path 路径 默认为当前路径
 */
var startup = function(port,path){
	
	server.startup(port,path);
}

module.exports = {
	startup: startup
};