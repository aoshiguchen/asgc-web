var $ = require(ASGC.home_dir + '/lib/server');

exports.command = 'start 	[port]';

exports.describe = 'start a project';

exports.builder = {
  
};

exports.handler = function (argv) {

	var port = undefined;

	try{
		if(argv.port){
	        port = parseInt(argv.port);
	    }
	}catch(e){
		throw new Error('参数格式有误!');
	}
    

 	$.startup(port);
};