var Callback = require('../../../../lib/util/callback');

function hello(args){

	var callback = new Callback(args,['zhangsan']);
	
	var ret = callback.invoked({
		'zhangsan': '张三',
		'lisi': '李四',
		'wangwu': '王五'
	});

}


hello(function(name){
	console.log('hello ' + name);
});

hello(['lisi',function(name){
	console.log('hello',name);
}]);

