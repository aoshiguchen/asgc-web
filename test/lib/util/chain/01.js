var chain = require('../../../../lib/util/chain');

function a(a,b){
	console.log('a:',a,b);
	//return [a + 1,b + 1];
	//return Array.prototype.slice.apply(arguments);
	return chain.doNext(arguments);
}

function b(a,b){
	console.log('b:',a,b);
	return a + b;
}

function c(n){
	console.log('c:',n);
	return n * 2;
}

function d(x){
	console.log(x);

	return 111;
}

// var a = chain(a,b);

// a.add(c)
//  .add(d);

// console.log(a.invoke(1,2));


var xx = chain();

xx.add(a)
 .add(b)
 .add(c)
 .add(d);

console.log(xx.invoke(1,2));


