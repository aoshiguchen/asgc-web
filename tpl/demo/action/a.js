var server = asgcjs.use('server');

server.defineAction('/hello',function(){
	
	return 'hello world !';
});