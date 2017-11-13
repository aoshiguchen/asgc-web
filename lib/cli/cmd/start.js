var $ = require(ASGC.home_dir + '/lib/server');

exports.command = 'start	[Absolute path]';

exports.describe = 'start a project';

exports.builder = {
  
};

exports.handler = function (argv) {
 	$.startup();
};