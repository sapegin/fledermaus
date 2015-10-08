'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports['default'] = createTemplateRenderer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ect = require('ect');

var _ect2 = _interopRequireDefault(_ect);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var defaultOptions = {
	ext: '.ect',
	root: 'templates'
};

/**
 * Returns function that renders ECT template.
 * 
 * @param {Object} options
 * @return {Function}
 */

function createTemplateRenderer() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	var renderer = (0, _ect2['default'])(_lodash2['default'].merge({}, defaultOptions, options));
	return function render(filepath, locals) {
		return renderer.render(filepath, locals);
	};
}

module.exports = exports['default'];