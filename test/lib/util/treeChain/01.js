var chain = require('../../../../lib/util/treeChain');

function a(a,b,c){

	return a + b;
}

var loader = chain();

var ret = loader.setRoot(a)
.invoke(1,2);

console.log(ret);