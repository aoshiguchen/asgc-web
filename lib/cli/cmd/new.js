var copy = require(ASGC.home_dir + '/lib/util/copy');

exports.command = 'new	[project]';
	
exports.describe = 'make a project template';

exports.builder = {
  
};

exports.handler = function (argv) {
 	var projectName = 'demo';

    if(argv.project){
        projectName = argv.project;
    }

    console.info('new app start');

    copy(ASGC.home_dir + '/tpl/demo',ASGC.work_dir + '/' + projectName, function (err) {  
        if (err) {  
            console.err('new  app error.');  
            console.err(err);  
        } else {  
      
            console.info('new app finished.');  
        }  
    });
};