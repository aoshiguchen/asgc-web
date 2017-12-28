var type = require('../type');
var Callback = require('../callback');
var entrust = {};
function Observer(obj){
	return {
		on: function(eventName,callback){
			if(!entrust[obj]){
				entrust[obj] = {};
			}
			if(!entrust[obj][eventName]){
				entrust[obj][eventName] = [];
			}
			entrust[obj][eventName].push(callback);
		},
		test: function(eventName){
			if(!(entrust[obj] && entrust[obj][eventName])){
				return false;
			}
			return true;
		},
		trigger: function(eventName,data){
			var result = [];
			if(!(entrust[obj] && entrust[obj][eventName])){
				return;
			}
			var param = [];
			for(var i in arguments){
				param.push(arguments[i]);
			}
			for(var i in entrust[obj][eventName]){
				var callback = entrust[obj][eventName][i];
				var res;
				if(type.isFunction(callback)){
					res = callback.apply(this,param.slice(1));
				}
				
				result.push(res);
			}
			if(result.length == 0){
				return null;
			}else if(result.length == 1){
				return result[0];
			}else{
				return result;
			}
		},
		triggerAction: function(eventName,data){
			var result = [];
			if(!(entrust[obj] && entrust[obj][eventName])){
				return;
			}
			var param = [];
			for(var i in arguments){
				param.push(arguments[i]);
			}
			for(var i in entrust[obj][eventName]){
				var callback = entrust[obj][eventName][i];
				var res;
				if(type.isFunction(callback)){
					res = callback.apply(this,param.slice(2));
				}else if(callback instanceof Callback){
					res = callback.invoked(data,this);
				}
				
				result.push(res);
			}
			if(result.length == 0){
				return null;
			}else if(result.length == 1){
				return result[0];
			}else{
				return result;
			}
		},
		triggerOne: function(eventName,data){
			if(!(entrust[obj] && entrust[obj][eventName])){
				return;
			}
			var param = [];
			for(var i in arguments){
				param.push(arguments[i]);
			}
			for(var i in entrust[obj][eventName]){
				try{
					var callback = entrust[obj][eventName][i];
					var res;

					if(type.isFunction(callback)){
						res = callback.apply(this,param.slice(1));
					}

					return res;
				}catch(e){
				}
			}
			return null;
		},
		triggerChain: function(eventName,data){
			var res = null;
			if(!(entrust[obj] && entrust[obj][eventName])){
				return;
			}
			var param = [];
			for(var i in arguments){
				param.push(arguments[i]);
			}
			for(var i in entrust[obj][eventName]){
				param[arguments.length] = res;
				var callback = entrust[obj][eventName][i];

				if(type.isFunction(callback)){
					res = callback.apply(this,param.slice(1));
				}
			}
			return res;
		},
	};
}
module.exports = Observer;
