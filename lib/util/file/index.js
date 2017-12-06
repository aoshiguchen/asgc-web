var fs = require('fs');

//递归遍历文件
var getFileList = function(path){
 
	var fileList = [];

	ergodicFile(path,'',fileList);

	return fileList;	
};

//递归遍历文件
var ergodicFile = function(path,relativePath,fileList){

	if(!fs.existsSync(path)){
		return;
	}

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(states.isDirectory()){

			ergodicFile(path + '/' + file,relativePath + '/' + file,fileList);

		}else{
			var obj = {};
			obj.size = states.size;
			obj.name = file;
			obj.path = path + '/' + file;
			obj.relativePath = relativePath + '/' + file;
			fileList.push(obj);

		}

	});

};

//读取文件内容
var readFile = function(path,encode){

	if(!encode){
		encode = 'utf-8';
	}

	var data = fs.readFileSync(path,encode);

	return data;

};

//读取文件内容
var read = function(path,type,encode = 'utf-8'){

	var data;

	if('bin' == type){
		data = fs.readFileSync(path);
	}else{
		data = fs.readFileSync(path,encode);
	}

	return data;

};

//读取文件json
var getJsonByPath = function(path,encode = 'utf-8'){

	return JSON.parse(readFile(path,encode));
}

//获取子文件夹
var getChildDirectorys = function(path){

	var fileList = [];

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(states.isDirectory()){

			var obj = {};
			obj.name = file;
			obj.path = path + '/' + file;
			fileList.push(obj);

		}

	});

	return fileList;

};

//获取子文件
var getChildFiles = function(path){

	var fileList = [];

	var files = fs.readdirSync(path);
	files.forEach(function(file){
		
		var states = fs.statSync(path + '/' + file);
		if(!states.isDirectory()){

			var obj = {};
			obj.size = states.size;
			obj.name = file;
			obj.path = path + '/' + file;
			fileList.push(obj);

		}

	});

	return fileList;
};

module.exports = {
	getFileList: getFileList,
	readFile: readFile,
	getChildDirectorys: getChildDirectorys,
	getChildFiles: getChildFiles,
	getJsonByPath: getJsonByPath,
	read: read
};