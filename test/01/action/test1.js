var server = asgc.use('server');
var logger = asgc.use('logger');

//测试请求重定向与请求转发
server.defineAction('/hello',function(){

	console.log('/hello...');
	logger.info('hello action');
	
	return 'hello world !';
});

server.defineAction('/hello2',function(){

	console.log('/hello2...');
	logger.info('hello2 action');
	
	return {
		'name': 'zhangsan',
		'age': 22,
		'sex': '男'
	};
});

server.defineAction('/hello3',function(){

	console.log('/hello3...');
	logger.info('hello3 action');
	
	return {
		view: '/WEB-INF/hello3.html',
		data: {
			msg: 'hello world !'
		}
	};
});


server.defineAction('/hello4',function(){

	console.log('/hello4...');
	logger.info('hello4 action');
	
	return 'view:/index.html';
});

server.defineAction('/hello5',function(){

	console.log('/hello5...');
	logger.info('hello5 action');
	
	return 1123;
});

server.defineAction('/hello6',function(){

	console.log('/hello6...');
	logger.info('hello6 action');
	
	return true;
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