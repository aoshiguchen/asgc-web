var server = asgc.use('server');
var logger = asgc.use('logger');

//测试请求重定向与请求转发
server.defineAction('/hello',function(){

	console.log('/hello...');
	logger.info('hello action');
	
	return 'hello world !';
});

server.defineAction('/test1',function(){

	console.log('/test1...');
	
	return 'redirect:http://www.baidu.com';
});

server.defineAction('/test2',function(){

	console.log('/test2...');
	
	return 'redirect:/hello';
});

server.defineAction('/test3',function(){

	console.log('/test3...');
	
	return 'redirect:http://localhost:8088/hello';
});

server.defineAction('/test4',function(){

	console.log('/test4...');
	
	return 'forward:/hello';
});