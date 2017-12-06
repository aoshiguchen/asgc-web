var Service = require('../../../../lib/util/service');

var service = new Service('action');

service.defineAction('/hello','GET',function(req,resp,args){
	console.log('hello');

	console.log(req,resp,args);

	return 'aa';
});

var a = service.http('/hello?a=1&b=2','GET',1,2,{
	name: 'zhangsan'	
},function(data){
	console.log('data:',data); 
},function(error){
	console.log(error);
});

console.log('a:',a);


var b = service.http('/hello1?a=1&b=2','GET',1,2,{
	name: 'zhangsan'	
},function(data){
	console.log('data:',data); 
},function(error){
	console.log(error);
});

console.log('b:',b);

var c = service.http('/hello1?a=1&b=2','GET',1,2,{
	name: 'zhangsan'	
});

console.log('c:',c);