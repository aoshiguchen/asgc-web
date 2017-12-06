
var parse = function(url){
	var ret = {};
	var index = url.indexOf('?');

	if(index == -1){
		ret.params = {};
		ret.suffix = getSuffix(url);
		ret.path = url.substr(0,url.length - ret.suffix.length);

		return ret;
	}

	ret.path = url.substr(0,index);
	ret.suffix = getSuffix(ret.path);
	ret.path = ret.path.substr(0,ret.path.length - ret.suffix.length);
	ret.params = [];

	if(url.length > index + 1){
		var paramsString = url.substr(index + 1);
		var paramList = paramsString.split('&');
	
		paramList.forEach(function(item){
			var index = item.indexOf('=');
			if(index != -1){
				var key = item.substr(0,index);
				var val = null;
				if(item.length > index + 1){
					val = item.substr(index + 1);
				}
				ret.params[key] = val;
			}
		});
	}

	return ret;
};


function getSuffix(url){
	var index = url.lastIndexOf('.');

	if(-1 == index){
		return '';
	}

	return url.substr(index);
}

module.exports = {
	parse: parse
};