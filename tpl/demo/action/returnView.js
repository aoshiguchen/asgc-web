var server = asgc.use('server');
var logger = asgc.use('logger');

//返回页面示例
server.defineAction('/returnView01',function(request, response,args){
	
	return 'view:/WEB-INF/returnView01.html'
});

//返回页面并渲染模板数据
server.defineAction('/returnView02',function(request, response,args){
	
	return {
		view: '/WEB-INF/returnView02.html',
		data: {
			title: 'this is returnView02 page',
			user: {
				name: '张三',
				age: 25,
				sex: '男',
				hobby: [
					'篮球',
					'乒乓球',
					'游泳',
					'音乐'
				]
			}
		}
	};
});

