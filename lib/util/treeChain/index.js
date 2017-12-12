var type = require('../type');

//TODO 未测试完

Array.prototype.insert = function (index, item){  
  this.splice(index, 0, item); 
  return this; 
};  

function TreeChain(r){
	var _root = r;
	var _context = {};

	_context.set = function(f){

		return {
			child: function(){
				var childs = f['childs'] || [];
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

		var _result;

		function execute(f){
			var args = Array.prototype.slice.apply(arguments).slice(1);
			var childs = f['childs'] || [];
			var result = f.apply(null,args);

			if(!result || result.on == undefined){
				_result = result;
				return;
			}

			var child;
			var on = result.on;
			var data = result.data;

			for(var i = 0;i < childs.length;i++){
				if(on == childs[i].key || on == childs.index){
					child = childs[i];
					break;
				}
			}

			if(!child){
				_result = result;
				return;
			}else{
				var f = child.fun;
				if('[object Array]' != toString.call(data)){
					data = [data];
				}

				data.insert(0,f);
				execute.apply(data);
			}
		}

		execute.apply(params);

		return _result;
	};




	return _context;
}

module.exports = TreeChain;