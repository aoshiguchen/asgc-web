var server = asgc.use('server');

//普通action示例
server.defineAction('/hello',function(){
	
	return 'hello world !';
});