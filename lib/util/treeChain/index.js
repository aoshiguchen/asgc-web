var type = require('../type');

// Array.prototype.insert = function (index, item){  
//   this.splice(index, 0, item); 
//   return this; 
// };  

function inserArray(arr,index,item){
	arr.splice(index, 0, item); 
	return arr;
}


function TreeChain(r){
	var _root = r;
	var _context = {};

	_context.set = function(f){

		return {
			child: function(){
				var childs = f.childs || [];
				var index = childs.length;

				if(type.isFunction(arguments[0])){
					for(var i = 0;i < arguments.length;i++){
						childs.push({
							index: index + i,
							key: null,
							fun: arguments[i]
						});
					}
					f.childs = childs;
				}else{
					childs.push({
						index: index,
						key: arguments[0],
						fun: arguments[1]
					});
					f.childs = childs;
				}

				return this; 
			},
			end: function(){
				return _context;
			}
		};
	};

	_context.setRoot = function(r){
		_root = r;

		return _context;
	};

	_context.invoke = function(){
		if(!_root){
			throw new Error('root未被正确设置!');
		}

		var params = [_root];

		for(var i = 0;i < arguments.length;i++){
			params.push(arguments[i]);
		}

		return _context.execute.apply(_context,params);
	};

	_context.execute = function(){
		if(arguments.length == 0){
			throw new Error('参数不能为空!');
		}

		var params = [];

		for(var i = 0;i < arguments.length;i++){
			params.push(arguments[i]);
		}

		var _result;

		function execute(f){
			var args = Array.prototype.slice.apply(arguments).slice(1);
			var childs = f.childs || [];
			var result = f.apply(null,args);


			if(!result || result.on == undefined){
				_result = result;
				return;
			}

			var child;
			var on = result.on;
			var data = result.data;

			if(result['type'] == 'stop'){
				_result = result.data;
				return;
			}

			for(var i = 0;i < childs.length;i++){
				if(on == childs[i].key || on == childs[i].index){
					child = childs[i];
					break;
				}
			}


			if(!child){
				_result = result.data;
				return;
			}else{
				var f = child.fun;
				if('[object Array]' != toString.call(data)){
					data = [data];
				}
				inserArray(data,0,f);
				execute.apply(null,data);
			}
		}

		execute.apply(null,params);

		return _result;
	};




	return _context;
}

TreeChain.doNext = function(){
	var on,args;

	if(arguments.length == 1){
		 var one = arguments[0];
		 if(type.isNumber(one)){
		 	on = one;
		 	args = [];
		 }else{
		 	on = 0;
		 	args = one;
		 }
	}else if(arguments.length == 2){
		on = arguments[0];
		args = arguments[1];
	}

	if(type.isArguments(args)){
		args = Array.prototype.slice.apply(args);
	}else if(!type.isArray(args)){
		args = [args];
	}

	return {
		on: on,
		data: args
	};
}

TreeChain.doStop = function(data){
	return {
		type: 'stop',
		data: data
	};
}

module.exports = TreeChain;