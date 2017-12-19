var chain = require('../../../../lib/util/treeChain');

function a(a,b,c){
	console.log('a...',arguments);

	return chain.doNext(0,[b,c]);
}

function b(a,b){
	console.log('b...');

	return chain.doNext(0,arguments);
}

function c(a,b){
	console.log('c...');

	return a - b;
}

function d(a,b){
	console.log('d...');

	return chain.doNext(0,[a*b]);
}

function e(a){
	console.log('e...');

	console.log(a);

	return 'ok';
}

var ret = chain()
		.setRoot(a)
		.set(a).child(b,c).end()
		.set(b).child(d).end()
		.set(d).child(e).end()
		.invoke(0,2,4);

console.log(ret);