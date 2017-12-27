var server = asgc.use('server');
var logger = asgc.use('logger');

var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        console.log(message);
    });
});

//请求转发示例
server.defineAction('/websocket01',function(){

	console.log('/websocket01...');
	 
	return 'view:/WEB-INF/websocket01.html';
});