var chain = require('../../../../lib/util/chain');

function a(a,b){
	console.log(a,b);

	return chain.doNext(arguments);
}

function b(a,b){
	console.log(a,b);

	return chain.doStop(11);
}

function c(a,b){
	console.log(a,b);

	return 10;
}

var loader = chain();

var ret = loader.add(a)
	  .add(b)
	  .add(c)
	  .invoke(1,2);

console.log('ret:',ret);