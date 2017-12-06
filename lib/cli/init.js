var fs = require('fs');
var path = require('path');
var config = require('../../package.json');
var strUtil = require('../util/string');

var asgc = {};
global.ASGC = asgc;

asgc.home_dir = strUtil.replaceAll(path.normalize(__dirname + '/../..'),'\\','/');
asgc.work_dir = strUtil.replaceAll(path.normalize(process.cwd()),'\\','/');
asgc.logo_path = asgc.home_dir + '/conf/asgc.txt';
asgc.app_config_path = asgc.home_dir + '/conf/app.json';
asgc.mime_config_path = asgc.home_dir + '/conf/mime.json';

asgc.logo = fs.readFileSync(asgc.logo_path,'utf-8');
asgc.name = config.name;
asgc.version = config.version;
asgc.description = config.description;
asgc.author = config.author;
asgc.license = config.license;

