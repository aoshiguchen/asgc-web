var server = asgc.use('server');
var logger = asgc.use('logger');

server.defineAction('/testadd',function(req,resp,args){
	
	logger.info('/testadd',args);
	var a = args.a? new Number(args.a) : 1; 
	var b = args.b? new Number(args.b) : 2; 
	var c = args.c? new Number(args.c) : 3; 

	return server.invoke('add',a,b,c);
});

server.defineAction('/testsub',function(req,resp,args){
	
	logger.info('/testadd',args);
	var a = args.a? new Number(args.a) : 4; 
	var b = args.b? new Number(args.b) : 2; 

	return server.invoke('sub',a,b);
});

