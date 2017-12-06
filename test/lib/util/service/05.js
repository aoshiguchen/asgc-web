var Service = require('../../../../lib/util/service');

var service = new Service('action');

service.defineAction('/hello','GET',function(req,resp,args){


	return 'aa';
});

service.defineAction('/hello','POST',function(req,resp,args){

	return 'aa';
});


console.log(service.get('/hello?a=1&b=2'));

console.log(service.post('/hello?a=1&b=2'));

console.log(service.http('/hello?a=1&b=2'));


console.log(service.test('/hello'));

console.log(service.testUrl('/hello'));