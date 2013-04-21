/**
 * Boilerplate instantiation
 */
if (typeof module !== 'undefined') {
	var GALAXY = require('./../GALAXY');
	var _ = require('underscore');
} else {
	if (!window.GALAXY) {
		window.GALAXY = {};
	}
	var GALAXY = window.GALAXY;
}

if (!GALAXY._prototypes) {
	GALAXY._prototypes = {};
}

if (!GALAXY._prototypes.UV_index) {
	GALAXY._prototypes.UV_index = {};
}

GALAXY._prototypes.UV_index.divide = function (divisions) {
	this.divisions = divisions;
	var div_numbers = _.map(_.range(0, divisions * 2), function (div) { return div / (divisions * 2) }, this);
	div_numbers.push(1);

	var parent = this;

	_.each(div_numbers, function (x_fraction, index) {
		if (index > 1) {
			var x_fraction_min = div_numbers[index - 2];
			_.each(div_numbers, function (y_fraction, y_index) {
				var y_fraction_min = div_numbers[y_index - 2];
				if (y_index > 1) {
					var min_x = parent.min_x + parent.width() * x_fraction_min;
					var max_x = parent.min_x + parent.width() * x_fraction;
					var min_y = parent.min_y + parent.height() * y_fraction_min;
					var max_y = parent.min_y + parent.height() * y_fraction;

					var div_index = new GALAXY.UV_index(min_x, max_x, min_y, max_y, parent);
					parent.children.push(div_index);
				}
			});
		}
	});

	if (!this.parent){
		this.init_fudge(1/divisions);
	}
};

GALAXY._prototypes.UV_index.width = function () {
	return this.max_x - this.min_x;
};

GALAXY._prototypes.UV_index.height = function () {
	return this.max_y - this.min_y;
};