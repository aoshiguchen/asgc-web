var server = asgc.use('server');

server.defineAction('/a',function(){
	
	return 'hello world !';
});

server.defineAction('/b',function(){


	
	return 'hello world !';
});


server.defineAction('www',function(){


	
	return 'welcome';
});

