var static = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//

var file = new(static.Server)(__dirname);

require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		//
		// Serve files!
		//
		console.log('serving ', request.url);
		file.serve(request, response);
	}).resume();
}).listen(8123);
