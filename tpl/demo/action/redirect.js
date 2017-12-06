var server = asgc.use('server');
var logger = asgc.use('logger');

//请求重定向示例
server.defineAction('/redirect1',function(){

	logger.info('/redirect1....');
	
	return 'redirect:http://www.baidu.com';
});

server.defineAction('/redirect2',function(){

	logger.info('/redirect2....');
	
	return 'redirect:/hello';
});