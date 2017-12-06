var Service = require('../../../../lib/util/service');

var service = new Service('action');

service.defineAction('/hello','GET',function(req,resp,args){


	return 'aa';
});

service.defineAction('/hello','GET',function(req,resp,args){

	return 'aa';
});

var ret = service.http('/hello?a=1&b=2','GET');

console.log(ret);


