var chain = require('../../../../lib/util/treeChain');

function a(a,b,c){
	console.log('a...');

	return chain.doNext(a,[b,c]);
}

function b(a,b){
	console.log('b...');

	return a + b;
}

function c(a,b){
	console.log('c...');

	return a - b;
}

var loader = chain(a);

loader.set(a).child('add',b);
loader.set(a).child('sub',c);

var ret = loader.invoke('sub',2,4);

console.log(ret);