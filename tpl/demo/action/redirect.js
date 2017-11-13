var server = asgcjs.use('server');
var logger = asgcjs.use('logger');

server.defineAction('/redirect1',function(){

	logger.info('/test1....');
	
	return 'redirect:http://www.baidu.com';
});