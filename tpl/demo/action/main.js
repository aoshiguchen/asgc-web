var server = asgcjs.use('server');

server.defineAction('test1',function(request, response){

	return 'this test1 page !';
});

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