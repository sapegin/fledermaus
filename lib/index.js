// Public API
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

// Default helpers

var _libHelpers = require('../lib/helpers');

var helpers = _interopRequireWildcard(_libHelpers);

var _core = require('./core');

Object.defineProperty(exports, 'loadConfig', {
	enumerable: true,
	get: function get() {
		return _core.loadConfig;
	}
});
Object.defineProperty(exports, 'loadSourceFiles', {
	enumerable: true,
	get: function get() {
		return _core.loadSourceFiles;
	}
});
Object.defineProperty(exports, 'generatePages', {
	enumerable: true,
	get: function get() {
		return _core.generatePages;
	}
});
Object.defineProperty(exports, 'savePages', {
	enumerable: true,
	get: function get() {
		return _core.savePages;
	}
});

// Default renderers

var _renderersMarkdown = require('./renderers/markdown');

exports.createMarkdownRenderer = _interopRequire(_renderersMarkdown);

var _renderersTemplate = require('./renderers/template');

exports.createTemplateRenderer = _interopRequire(_renderersTemplate);
exports.helpers = helpers;