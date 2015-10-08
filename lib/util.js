'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.removeExtension = removeExtension;
exports.getExtension = getExtension;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.readYamlFile = readYamlFile;
exports.tmpl = tmpl;
exports.meta = meta;
exports.og = og;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

/**
 * Remove extension from file name.
 * 
 * @param {String} filename
 * @return {String}
 */

function removeExtension(filename) {
  return filename.replace(/\.\w+$/, '');
}

/**
 * Returns extension of a file (without the leading dot).
 * 
 * @param {String} filename
 * @return {String}
 */

function getExtension(filename) {
  return _path2['default'].extname(filename).replace(/^\./, '');
}

/**
 * Read text file.
 * 
 * @param {String} filepath
 * @return {String}
 */

function readFile(filepath) {
  return _fs2['default'].readFileSync(filepath, { encoding: 'utf8' });
}

/**
 * Save text to a file (create all folders if necessary).
 * 
 * @param {String} filepath
 * @param {String} content
 * @return {String}
 */

function writeFile(filepath, content) {
  _mkdirp2['default'].sync(_path2['default'].dirname(filepath));
  return _fs2['default'].writeFileSync(filepath, content, { encoding: 'utf8' });
}

/**
 * Read YAML file.
 * 
 * @param {String} filepath
 * @return {String}
 */

function readYamlFile(filepath) {
  try {
    return _jsYaml2['default'].safeLoad(readFile(filepath));
  } catch (e) {
    console.log('Cannot read YAML file ' + filepath + ':', e);
  }
}

/**
 * Simple templates: {key}.
 * 
 * @param {String} template Template.
 * @param {Object} params Substitutions.
 * @return {String}
 */

function tmpl(template) {
  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return template.replace(/\{([^\}]+)\}/g, function (m, key) {
    return params[key] || m;
  });
}

/**
 * Returns HTML meta tag.
 * 
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */

function meta(name, content) {
  return '<meta name="' + name + '" content="' + content + '">';
}

/**
 * Returns HTML meta tag for Open Graph.
 * 
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */

function og(name, content) {
  return '<meta property="' + name + '" content="' + content + '">';
}