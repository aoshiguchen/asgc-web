var file = require('../../../../lib/util/file');

// var s = file.readFile('../../../../pages/favicon.ico');

// console.log(s);

 var buf = file.read('../../../../pages/favicon.ico','bin');

console.log(buf);
