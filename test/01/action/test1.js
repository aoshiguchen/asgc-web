var server = asgcjs.use('server');

server.defineAction('/hello',function(){
	
	return 'hello world !';
});

server.defineAction('/test1',function(){
	
	return 'redirect:http://www.baidu.com';
});

server.defineAction('/test2',function(){
	
	return 'redirect:/hello';
});

server.defineAction('/test3',function(){
	
	return 'redirect:http://localhost:8088/hello';
});