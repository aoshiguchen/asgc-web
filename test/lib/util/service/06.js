var Service = require('../../../../lib/util/service');

var service = new Service('action');

service.defineAction('/hello','GET',['args',function(args){

	console.log(args);

	return 'aa';
}]);


console.log(service.get('/hello?a=1&b=2','1','2',{'c':2}));
