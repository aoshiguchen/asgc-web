var chain = require('../../../../lib/util/treeChain');

function a(a,b,c){
	console.log('a...',a,b);

	return chain.doNext(c,[a + 1,b + 1]);
}

function b(a,b){
	console.log('b...',a,b);

	return chain.doNext([a + 1,b + 1]);
}

function c(a,b){
	console.log('c...',a,b);

	return chain.doNext([a + 1,b + 1]);
}

function d(a,b){
	console.log('d...',a,b);

	return chain.doNext(0,[a - 1,b - 1]);
}

function e(a,b){
	console.log('e...',a,b);


	return chain.doNext(0,[a - 1,b - 1]);
}

var loader = chain()
		.setRoot(a)
		.set(a).child(b,d).end()
		.set(b).child(c).end()
		.set(d).child(e).end();

var ret = loader.invoke(2,3,1);

console.log(ret);



// loader.setRoot(b);
// console.log(loader.invoke(1,2));
console.log(loader.execute(c,1,2));