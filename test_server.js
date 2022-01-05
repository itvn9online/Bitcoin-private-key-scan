var http = require('http');

//
var open_port = 8081;
console.log('Open port: ' + open_port);

//create a server object:
http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    response.end('Hello World! ' + Math.random());
    response.end(str);
}).listen(open_port);
