var fs = require("fs");
var path = process.cwd();
var packageJson = require('../../package.json');
var $ = require('../server');
var copy = require('../util/copy');

var asgc = {};
global.ASGC = asgc;

var run = function (obj) {

    asgc.logo = fs.readFileSync(__dirname + '/../../conf/asgc.txt','utf-8');

    if(obj[0] === '-v'){

        

        console.log(asgc.logo);

        console.log('VERSION:' + packageJson['version']);

    }else if(obj[0] === '-h'){

        console.log('Useage:');
        console.log('  -v --version  [show version]');
        console.log('  start         [start web app]');
        console.log('  new [project] [new app]');

    }else if(obj[0] === 'start'){

        $.startup();
    }else if(obj[0] === 'new'){

        var projectName = 'demo';

        if(obj.length >= 2){
            projectName = obj[1];
        }

        var srcDir = __dirname;
        var targetDir = process.cwd();

        console.info('new app start')

        copy(srcDir  + '/../../tpl/demo',targetDir + '/' + projectName, function (err) {  
            if (err) {  
                console.err('new  app error.');  
                console.err(err);  
            } else {  
          
                console.info('new app finished.');  
            }  
        });
        
    }
};

module.exports.run = run;