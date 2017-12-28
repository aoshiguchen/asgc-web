var server = asgc.use('server');

server.defineAction('/test4-1',['args',function(args){
	
	console.log('args:',args);

	return 'hello world !';
}]);

