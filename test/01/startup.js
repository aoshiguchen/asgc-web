var $ = require('../../lib/server');
var fs = require('fs');

global.ASGC = {};
global.ASGC.logo = fs.readFileSync('../../conf/asgc.txt','utf-8');

$.configure({
	logger: {
		file: 'logs/system.log'
	},
	app: {
		path: __dirname,
		config: {
	
		}
	}
});

$.startup();