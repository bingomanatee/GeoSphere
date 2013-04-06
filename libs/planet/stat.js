if ('module') {
	var window = module.exports;
	var _ = require('underscore');
}

window.Stat = {

	mean:  function (array) {
		array = _.reject(array, isNaN);
		return array.reduce(function (a, b) {return a + b;}) / array.length;
	},

	stdev: function (array, mean) {
		array = _.reject(array, isNaN);
		if (arguments.length < 2) mean = window.Stat.mean(array);
		var	dev = array.map(function (itm) {return (itm - mean) * (itm - mean);});
		return Math.sqrt(dev.reduce(function (a, b) {return a + b;}) / array.length);
	}
};