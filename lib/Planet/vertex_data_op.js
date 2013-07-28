var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (index, key) {
	var args = _.toArray(arguments);
	var new_value = this.vertex_data(index, key);
	if(isNaN(new_value)) new_value = 0;
	_.range(2, args.length, 2).forEach(function (index) {
		var value = args[index];
		if(/^\^/.test(value)){
			value = this.vertex_data(index, value.replace(/^\^/, ''));
		}

		var op = args[index + 1];
		//console.log('start: %s, op: %s, value: %s', new_value, op, value);
		switch (op) {
			case '+':
				new_value += value;
				break;

			case '-':
				new_value -= value;
				break;

			case '*':
				new_value *= value;
				break;

			case '/':
				new_value /= value;
				break;

			case 'min':
				new_value =  Math.min(new_value, value);
				break;

			case 'max':
				new_value = Math.max(new_value, value);
				break;

		}
	}, this);

	return this.vertex_data(index, key, new_value);
}