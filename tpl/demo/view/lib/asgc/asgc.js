(function(global, factory){
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Asgc = factory());
})(this,(function(){

	function Asgc(config){
		if(!(this instanceof Asgc)){
			return new Asgc(config);
		}

		if(!config){
			throw new Error('config is null');
		}

		if(types.isArray(config)){
			var ret = [];
			for(var i = 0; i < config.length; i++){
				var obj = new Asgc(config[i]);
				ret.push(obj);
			}
			return ret;
		}

		if(!config.scope){
			throw new Error('scope is null');
		}

		if(!config.data){
			throw new Error('data is null');
		}
			
		this.dbBind = function(ele){
			var mvs = ele.querySelectorAll('[asgc-mv]');
			var vms = ele.querySelectorAll('[asgc-vm]');
			var mvvms = ele.querySelectorAll('[asgc-mvvm]');
			var csss = ele.querySelectorAll('[asgc-css]');

			for(var i = 0; i < mvs.length; i++){
				var mv = mvs[i];
				var name = mv.getAttribute('asgc-mv');

				this.bindMv(name,mv);
			}

			for(var i = 0; i < vms.length; i++){
				var vm = vms[i];
				var name = vm.getAttribute('asgc-vm');

				this.bindVm(vm,name);
			}

			for(var i = 0; i < mvvms.length; i++){
				var mvvm = mvvms[i];
				var name = mvvm.getAttribute('asgc-mvvm');

				this.bindVm(mvvm,name);
				this.bindMv(name,mvvm);
			}

			for(var i = 0 ; i < csss.length; i++){
				var el = csss[i];
				var val = el.getAttribute('asgc-css');

				this.bindCss(el,val);
			}

		}

		this.bindMv = function(name,mv){
			var arr = name.split(':');
			var attrType = arr[0];
			var attrData = arr[1];

			var data = this.data;

			// console.log('bindMv',name,data);

			setViewData(mv,attrType,data[attrData]);

			// this.lisenter.change(attrData,function(val){
			// 	console.log('data change:',data,attrType);
			// 	setViewData(mv,attrType,val);
			// });

			this.lisenter.el(attrData,function(val){
				// console.log('data change:',data,attrType);

				if(val == 'false'){
					val = false;
				}else if(val == 'true'){
					val == true;
				}

				setViewData(mv,attrType,val);
			});
		}

		this.bindCss = function(el,val){
			
			var data = this.data;

			this.lisenter.el(val,function(text){

				var arr = text.split(':');
				var cssName = arr[0];
				var cssVal = arr[1];

				setViewCss(el,cssName,cssVal);
			});

		}

		this.bindVm = function(vm,name){
			var arr = name.split(':');
			var attrType = arr[0];
			var attrData = arr[1];
			var data = this.data;

			var parseRet = regExp.parseEl(attrData);
			attrData = getOnlyKey(parseRet);
			
			// console.log('bindVm',name,data);

			setViewData(vm,attrType,data[attrData]);

			onchange(vm,function(event){
				var val = getViewData(vm,attrType);
				data[attrData] = val;
			});
		}

		this.scope = config.scope;
		this.data = config.data;
		this.lisenter = lisen(config.data);

		this.eles = getElementsByScope(this.scope);

		for(var i = 0; i < this.eles.length; i++){
			this.dbBind(this.eles[i]);
		}

	}

	function getOnlyKey(json){

		var key;

		for(var key in json){

		}

		return key;
	}

	function getElementsByScope(scope){
		return document.querySelectorAll('[asgc-scope=' + scope + ']');
	}
	
	function getValue(data){

		if(types.isNull(data) || types.isUndefined(data)){
			return '';
		}

		return data;
	}	

	function setViewCss(el,name,val){
		el.style[name] = val;
	}

	function setViewData(mv,type,data){
		// console.log('setViewData',mv,type,data);
		mv.checked = false;

		if(type === 'val'){
			mv.value = getValue(data);
		}else if(type === 'html'){
			mv.innerHTML = getValue(data);
		}else if(type === 'checked'){
			mv.checked = getValue(data);
		}else{
			mv[type] = getValue(data);
		}
	}

	function getViewData(vm,type){
		if(type === 'val'){
			return vm.value;
		}else if(type === 'html'){
			return vm.innerHTML;
		}else if(type === 'checked'){
			return vm.checked;
		}
	}

	function onchange(ele,callback){
		var ie = !!window.ActiveXObject;  
		if(ie){  
		    ele.onpropertychange = callback;  
		}else{  
		    ele.addEventListener("input",callback,false);  
		}  
	}

	return Asgc;

}));

var types = (function(){
	var types = {};

	types.getType = function(val){
		var typeStrig = toString.call(val);

		return typeStrig.slice(8,typeStrig.length - 1);
	}

	types.isNull = function(val){

		return types.getType(val) === 'Null';
	}

	types.isUndefined = function (val){

		return types.getType(val) === 'Undefined';
	}

	types.isArray = function(val){

		return types.getType(val) === 'Array';
	}

	types.isObject = function(val){

		return types.getType(val) === 'Object';
	}

	types.isRegExp = function(val){

		return types.getType(val) === 'RegExp';
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

var lisen = (function(){
	var contextMap = {};

	function clone(obj){

		var type = getType(obj);

		if(type === 'Object'){
			return JSON.parse(JSON.stringify(obj));
		}
		
	}

	function getType(val){

		var typeString = toString.call(val);

		return typeString.slice(8,typeString.length - 1);
	}

	//同一个obj只能存在于一个lisen对象中
	var lisen = function(obj){
		if(!(this instanceof lisen)){
			return new lisen(obj);
		}

		var val = clone(obj);
		var getterCallbacks = {};
		var setterCallbacks = {};

		this.init = function(key){
			var property =  Object.getOwnPropertyDescriptor(obj,key);
			var getter = property && property.get;
			var setter = property && property.set;

			if(!getter){
				defineGetProperty(obj,key,function(v){
					return val[key];
				});
			}

			if(!setter){
				defineSetProperty(obj,key,function(v){
			    	val[key] = v;
				});
			}
		};

		this.set = function(key,callback){
			this.init(key);

			if(!setterCallbacks[key]){
				setterCallbacks[key] = [];
			}

			setterCallbacks[key].push(callback);

			defineSetProperty(obj,key,function(v){
				//只有值发生变化，才进行回调
				if(v === val[key]){
					return;
				}

		    	val[key] = v;

		    	//支持多个监听者
		    	for(var i in setterCallbacks[key]){
		    		setterCallbacks[key][i].apply(this,arguments);
		    	}

			});

			return this;
		};

		this.get = function(key,callback){
			this.init(key);

			if(!getterCallbacks[key]){
				getterCallbacks[key] = [];
			}

			getterCallbacks[key].push(callback);

			defineGetProperty(obj,key,function(){
		    	
		    	//支持多个监听者
		    	for(var i in getterCallbacks[key]){
		    		getterCallbacks[key][i].call(this,val[key]);
		    	}

		    	return val[key];
			});

			return this;
		};

		this.el = function(text,callback){
			var parseRet = regExp.parseEl(text);
			
			callback(elRender(text,parseRet,val));

			for(var key in parseRet){
				this.set(key,function(){
					callback(elRender(text,parseRet,val));
				});
			}

		};

		this.change = this.set;

		this.watch = this.get;
	};

	function elRender(text,parseRet,data){
		if(isEmptyObject(parseRet)){
			return text;
		}

		for(var key in parseRet){
			if(!isEmptyObject(parseRet[key])){
				for(var i = 0; i < parseRet[key].length; i++){
					var tmp = data[key];
					if(null === tmp || undefined === tmp){
						tmp = '';
					}

					text = replaceAll(text,parseRet[key][i],tmp);
				}
			}
		}

		return text;
	}

	function def(obj,key,val,enumerable) {
	  Object.defineProperty(obj, key, {
	    value: val,
	    enumerable: !! enumerable,
	    writable: true,
	    configurable: true
	  });
	}

	function defineSetProperty(obj,key,callback){
		Object.defineProperty(obj,key, {
		    set: callback,
		    enumerable: true,
		    configurable: true
		});
	}

	function defineGetProperty(obj,key,callback){
		Object.defineProperty(obj,key, {
		    get: callback,
		    enumerable: true,
		    configurable: true,
		});
	}

	function isEmptyObject(e) {
		var t;
		for (t in e)
			return !1;
		return !0
	}

	function replaceAll(src,oldStr,newStr){
		var index;
		while((index = src.indexOf(oldStr)) >= 0){
			src = src.replace(oldStr,newStr);
		}
		return src;
	}
	
	return lisen;
})();


var regExp = (function(){
	var regExp = {};

	regExp.parseEl = function(text){
		var regExp = /({{\s*(\w+)\s*}})/ig;
		var ret = {};
		var r = null;

		while(r = regExp.exec(text)){
			var s1 = r[1];
			var s2 = r[2];
			
			if(!ret[s2]){
				ret[s2] = [];
			}
			ret[s2].push(s1);
		}

		return ret;
	};

	return regExp;
})();