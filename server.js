var static = require('node-static');

var file = new(static.Server)(__dirname);

require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		file.serve(request, response);
	});
}).listen(8080);