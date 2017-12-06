var server = asgc.use('server');

server.defineService('add',function(a,b,c){
	console.log('service add invoked !');
	return a + b + c;
});

server.defineService('sub',function(a,b){
	console.log('service sub invoked !');
	return a - b;
});

