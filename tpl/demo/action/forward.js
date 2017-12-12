var server = asgc.use('server');
var logger = asgc.use('logger');

//请求转发示例
server.defineAction('/forward1',function(){

	console.log('/forward1...');
	 
	return 'forward:/hello';
});