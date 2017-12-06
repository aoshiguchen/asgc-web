var server = asgc.use('server');
var logger = asgc.use('logger');

//返回json示例
server.defineAction('/test4',function(request, response,args){

	logger.info('test4','start');

	console.log('参数:',args);

	return {
		name: '张三',
		age: 25,
		sex: '男',
		hobby: [
			'篮球',
			'乒乓球',
			'游泳',
			'音乐'
		],
	};
});