var app = function (request, response) {
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("Hello World\n");
    },
    port = 7779;

var http = require('http');

var server = http.createServer(app).listen(port);

// jdebug-server
require('./Index')(app, server, 'jasper.json');
// static files handler
// jdebug-server

app['jDebugServer']();

console.log('Server listening on port: ' + port);