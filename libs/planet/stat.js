if ('module') {
	var window = module.exports;
	var _ = require('underscore');
	var _DEBUG = true;
}

window.Stat = {

	mean:  function (array) {
		return window.Stat.sum(_.reject(array, isNaN))/ array.length;
	},

	sum: function(array){
		return array.reduce(function (a, b) {return a + b;})
	},

	stdev: function (array, mean) {
		array = _.reject(array, isNaN);
		if (arguments.length < 2) mean = window.Stat.mean(array);
		var	dev = array.map(function (itm) {return (itm - mean) * (itm - mean);});
		return Math.sqrt(window.Stat.sum(dev) / array.length);
	},

	q: function(array){
		array = _.sortBy(array, _.identity);
		var distances = _.map(array, function(value, index){
			var distances = [];
			if (index > 0){
				var v0 = array[index - 1];
				distances.push(Math.abs(v0 - value));
			}
			if (index < array.length - 1){
				var v1 = array[index + 1];
				distances.push(Math.abs(v1 - value));
			}
			return  _.min(distances, _.identity);
		});

		var avg = window.Stat.mean(distances);
		var stdev = window.Stat.stdev(distances);
		if (stdev <= 0) return array;

		var max = avg + stdev;
		//console.log('q avg: %s, stdev: %s, max: %s', avg, stdev, max);

		return _.filter(array, function(value, index){
			var distance = distances[index];
			//console.log('value: %s, distance: %s', value, distance);
			return distance < max;
		})
	},

	qa: function(array){

		var avg = window.Stat.mean(array);
		var stdev = window.Stat.stdev(array);
		if (stdev <= 0) return array;

		var max = avg + stdev * 1.5;
		var min = avg - stdev * 1.5;

		return _.filter(array, function(value, index){
			return value <= max && value >= min;
		})
	}
};