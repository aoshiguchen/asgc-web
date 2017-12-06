var server = asgc.use('server');

//配置文件进行路由示例
server.defineAction('test1',function(request, response){

	return 'this test1 page !';
});

//返回json、text示例
server.defineAction('/test2',function(request, response){

	return {
		a: '11',
		b: '22'
	};
});

server.defineAction('/test3',function(request, response){

	return true;
});

server.defineAction('/index',function(request, response){

	return 'this is index action ...';
});