'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.filepathToUrl = filepathToUrl;
exports.renderByType = renderByType;
exports.parsePage = parsePage;
exports.getSourceFilesList = getSourceFilesList;
exports.loadSourceFiles = loadSourceFiles;
exports.getConfigFilesList = getConfigFilesList;
exports.readConfigFiles = readConfigFiles;
exports.mergeConfigs = mergeConfigs;
exports.loadConfig = loadConfig;
exports.makeContext = makeContext;
exports.generatePage = generatePage;
exports.generatePages = generatePages;
exports.savePage = savePage;
exports.savePages = savePages;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fastmatter2 = require('fastmatter');

var _fastmatter3 = _interopRequireDefault(_fastmatter2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('./util');

function filepathToUrl(filepath) {
	var url = '/' + (0, _util.removeExtension)(filepath);
	url = url.replace(/\/index$/, '');
	if (url === '') {
		return '/';
	}
	return url;
}

function renderByType(source, filepath) {
	var renderers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var extension = (0, _util.getExtension)(filepath);
	var render = renderers[extension];
	if (_lodash2['default'].isFunction(render)) {
		return render(source);
	}
	return source;
}

function parsePage(source, folder, filepath) {
	var renderers = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

	var _fastmatter = (0, _fastmatter3['default'])(source);

	var attributes = _fastmatter.attributes;
	var body = _fastmatter.body;

	var content = renderByType(body, filepath, renderers);
	var url = filepathToUrl(filepath);

	return _lodash2['default'].merge(attributes, {
		sourcePath: filepath,
		content: content,
		url: url
	});
}

function getSourceFilesList(folder, types) {
	var typesMask = types.join(',');
	var mask = '**/*.{' + typesMask + '}';
	return _glob2['default'].sync(mask, { cwd: folder });
}

function loadSourceFiles(folder, types) {
	var renderers = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var files = getSourceFilesList(folder, types);
	return files.map(function (filepath) {
		var source = (0, _util.readFile)(_path2['default'].join(folder, filepath));
		return parsePage(source, folder, filepath, renderers);
	});
}

function getConfigFilesList(folder) {
	return _glob2['default'].sync(_path2['default'].join(folder, '*.yml'));
}

function readConfigFiles(files) {
	return files.reduce(function (configs, filepath) {
		var name = (0, _util.removeExtension)(_path2['default'].basename(filepath));
		if (name === 'default') {
			configs['default'] = (0, _util.readYamlFile)(filepath);
		} else {
			configs.langs[name] = (0, _util.readYamlFile)(filepath);
		}
		return configs;
	}, { 'default': {}, langs: {} }); // @todo use really default config
}

function mergeConfigs(configs) {
	var langs = configs.langs;

	if (_lodash2['default'].isEmpty(langs)) {
		return {
			'default': configs['default']
		};
	}

	return Object.keys(langs).reduce(function (merged, lang) {
		merged[lang] = _lodash2['default'].merge({}, configs['default'], langs[lang]);
		return merged;
	}, {});
}

function loadConfig(folder) {
	var files = getConfigFilesList(folder);
	var configs = readConfigFiles(files);
	return mergeConfigs(configs);
}

function makeContext(document, config, helpers) {
	return _lodash2['default'].merge({}, helpers, { config: config }, document);
}

function generatePage(document, config, helpers, renderers) {
	if (!document.layout) {
		throw new Error('Layout not specified for ' + document.sourcePath + '. Add "layout" front matter field.');
	}

	var _$pairs$shift = _lodash2['default'].pairs(renderers).shift();

	var _$pairs$shift2 = _slicedToArray(_$pairs$shift, 2);

	var templateExtension = _$pairs$shift2[0];
	var render = _$pairs$shift2[1];

	var templateFile = document.layout + '.' + templateExtension;

	var context = makeContext(document, config, helpers);
	var content = render(templateFile, context);

	return {
		pagePath: (0, _util.removeExtension)(document.sourcePath),
		content: content
	};
}

function generatePages(documents, config, helpers, renderers) {
	return documents.map(function (document) {
		return generatePage(document, config, helpers, renderers);
	});
}

function savePage(page, folder) {
	(0, _util.writeFile)(_path2['default'].join(folder, page.pagePath + '.html'), page.content);
}

function savePages(pages, folder) {
	return pages.map(function (page) {
		return savePage(page, folder);
	});
}