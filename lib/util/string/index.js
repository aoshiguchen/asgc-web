function replaceAll(src,oldStr,newStr){
	var index;
	while((index = src.indexOf(oldStr)) >= 0){
		src = src.replace(oldStr,newStr);
	}
	return src;
}

module.exports = {
	replaceAll: replaceAll
};