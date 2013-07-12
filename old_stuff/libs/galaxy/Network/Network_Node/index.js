var fs = require('fs');

var files = fs.readdirSync(__dirname);

var name = __filename.split('/').pop();

files.forEach(function(file){
	if (file != name){
		require('./' + file);
	}
});