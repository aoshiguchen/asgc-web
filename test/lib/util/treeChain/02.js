var chain = require('../../../../lib/util/treeChain');

function a(a,b,c){
	console.log('a...');

	return {
		on: a,
		data: [b,c]
	};
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

loader.set(a).child(b);
loader.set(a).child(c);

var ret = loader.invoke(1,2,4);

console.log(ret);