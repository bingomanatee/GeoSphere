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

    if (isNaN(new_value)) new_value = 0;
    if (_DEBUG) console.log('args length: %s', args.length);
    _.range(2, args.length, 2).forEach(function (arg_index) {
        var value = args[arg_index];
        var op = args[arg_index + 1];
        if (_DEBUG)   console.log('index: ', index, 'arg index: ', arg_index,
            'original value: ', new_value,
            'modifier: ', value, 'operator: ', op);

        if (/^\^/.test(value)) {
            if (_DEBUG)   console.log(index, value, '= ');
            value = this.vertex_data(index, value.replace(/^\^/, ''));
            if (_DEBUG)   console.log('  ', value);
        }

        if (_DEBUG) console.log('start: %s, op: %s, value: %s', new_value, op, value);
        switch (op) {

            case '=':
                new_value = value;
                break;

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
                new_value = Math.min(new_value, value);
                break;

            case 'max':
                new_value = Math.max(new_value, value);
                break;

        }

        if (_DEBUG) console.log('end: %s', new_value);
    }, this);

    return this.vertex_data(index, key, new_value);
}