'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = createMarkdownRenderer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

var _highlightJs = require('highlight.js');

var _highlightJs2 = _interopRequireDefault(_highlightJs);

var _parse5 = require('parse5');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var parser = new _parse5.Parser();

var Renderer = (function (_marked$Renderer) {
	_inherits(Renderer, _marked$Renderer);

	function Renderer() {
		_classCallCheck(this, Renderer);

		_get(Object.getPrototypeOf(Renderer.prototype), 'constructor', this).apply(this, arguments);
	}

	_createClass(Renderer, [{
		key: 'heading',

		// Do not put IDs in headers
		value: function heading(text, level) {
			var tag = 'h' + level;
			return '<' + tag + '>' + text + '</' + tag + '>\n';
		}

		// Custom tags
	}, {
		key: 'html',
		value: function html(_html) {
			if (_html.startsWith('<x-')) {
				// Parse tag’s HTML
				var dom = parser.parseFragment(_html);
				var node = dom.childNodes[0];
				var tagName = node.tagName;
				var attrs = node.attrs;

				tagName = tagName.replace(/^x-/, '');

				// Check tag function
				var tagFunction = this.options.customTags[tagName];
				if (!tagFunction || !_lodash2['default'].isFunction(tagFunction)) {
					throw new Error('Custom tag "' + tagName + '" is not defined or is not a function.');
				}

				// Unzip attributes
				attrs = attrs.reduce(function (attrsObj, attr) {
					attrsObj[attr.name] = attr.value;
					return attrsObj;
				}, {});

				// Render
				return tagFunction(attrs);
			}
			return _html;
		}
	}]);

	return Renderer;
})(_marked2['default'].Renderer);

var defaultOptions = {
	renderer: Renderer,
	hljs: {
		tabReplace: null,
		aliases: {
			yaml: 'python',
			shell: 'bash'
		}
	},
	customTags: {}
};

/**
 * Returns function that renders Markdown using Marked.
 * 
 * @param {Object} options
 * @return {Function}
 */

function createMarkdownRenderer() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	options = _lodash2['default'].merge({}, defaultOptions, options);

	// HACK: global Highlight.js options
	_highlightJs2['default'].configure(options.hljs);

	var markedOptions = {
		renderer: new options.renderer(),
		customTags: options.customTags,
		highlight: function highlight(code, lang) {
			if (lang) {
				return _highlightJs2['default'].highlight(options.hljs.aliases[lang] || lang, code).value;
			} else {
				return _highlightJs2['default'].highlightAuto(code).value;
			}
		}
	};

	return function render(source) {
		return (0, _marked2['default'])(source, markedOptions);
	};
}

module.exports = exports['default'];