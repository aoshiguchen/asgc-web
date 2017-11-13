require('./init');

var yargs = require('yargs');

var version_content = ASGC.logo + '\n' + 'Version ' + ASGC.version;

yargs.commandDir('cmd')
	.usage('Usage: $0 <command> [options]')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .version(version_content)
    .argv;