var fs = require("fs");
var config = require('../../package.json');

var asgc = {};
global.ASGC = asgc;

asgc.home_dir = __dirname + '/../..';
asgc.work_dir = process.cwd();
asgc.logo = fs.readFileSync(asgc.home_dir + '/conf/asgc.txt','utf-8');
asgc.name = config.name;
asgc.version = config.version;
asgc.description = config.description;
asgc.author = config.author;
asgc.license = config.license;