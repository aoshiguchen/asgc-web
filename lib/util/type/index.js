module.exports = (function(){
	var types = {};

	types.getType = function(val){
		var typeStrig = toString.call(val);

		return typeStrig.slice(8,typeStrig.length - 1);
	}

	types.isType = function(val,type){

		return types.getType(val) === type;
	}

	types.isString = function(val){

		return types.isType(val,'String');
	}

	types.isNull = function(val){

		return types.isType(val,'Null');
	}

	types.isNumber = function(val){

		return types.isType(val,'Number');
	}

	types.isBoolean = function(val){

		return types.isType(val,'Boolean');
	}

	types.isUndefined = function (val){

		return types.isType(val,'Undefined');
	}

	types.isArray = function(val){

		return types.isType(val,'Array');
	}

	types.isObject = function(val){

		return types.isType(val,'Object');
	}

	types.isRegExp = function(val){

		return types.isType(val,'RegExp');
	}

	types.isFunction = function(val){

		return types.isType(val,'Function');
	}

	types.toString = function(val) {
	  return val == null
	    ? ''
	    : typeof val === 'object'
	      ? JSON.stringify(val, null, 2)
	      : String(val)
	}

	types.toNumber = function(val) {
	  var n = parseFloat(val);
	  return isNaN(n) ? val : n
	}

	return types;
})();