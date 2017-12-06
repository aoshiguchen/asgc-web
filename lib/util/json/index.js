var merge = function(a,b){
	if(!b) return a;

	a = a || {};

	for(var key in b){
		a[key] = b[key];
	}

	return a;
}

module.exports = {
	merge: merge
};