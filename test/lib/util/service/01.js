var Service = require('../../../../lib/util/service');

var serviceA = new Service('a');
var serviceB = new Service('b');

serviceA.add('hello',function(){
	console.log('hello A 1');

	return 1;
});

serviceA.add('hello',function(){
	console.log('hello A 2');

	return 2;
});

serviceB.add('hello',function(){
	console.log('hello B 1');

	return 3;
});

console.log(serviceA.invoke('hello'));
console.log(serviceB.invoke('hello'));

console.log(serviceA.test('hello'));
console.log(serviceA.test('aaa'));

console.log(serviceB.test('hello'));
console.log(serviceB.test('aaa'));