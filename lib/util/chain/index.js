function chain(){

	var funs = [];

	for(var i = 0;i < arguments.length;i++){
		funs.push(arguments[i]);
	}

	return {
		add: function(){
			if(arguments.length < 1){
				throw new Error('参数有误!'); 
			}

			for(var i = 0;i < arguments.length;i++){
				funs.push(arguments[i]);
			}

			return this;
		},
		invoke: function(){
			var params = [];

			for(var i = 0;i < arguments.length;i++){
				params.push(arguments[i]);
			}

			for(var i in funs){
				if('[object Array]' == toString.call(params)){
					params = funs[i].apply(null,params);
				}else{
					if(params['type'] == 'stop'){
						return params['data'];
					}; 

					params = funs[i].apply(null,[params]);
				}
			}

			return params;
		}
	}
}

chain.doNext = function(args){
	return Array.prototype.slice.apply(args);
}

chain.doStop = function(data){
	return {
		type: 'stop',
		data: data
	};
}

module.exports = chain;