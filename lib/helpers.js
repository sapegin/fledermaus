/**
 * Context (this):
 * {
 *   config: {default: {}, en: {}, ru: {}},
 *   sourcePath: 'en/mypost.md',
 *   url: 'en/mypost',
 *   content: '...html...',
 *   title: 'My post',
 *   ...frontmatter fields...
 * } 
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.option = option;
exports.pageLang = pageLang;
exports.__ = __;
exports.plural = plural;
exports.pageUrl = pageUrl;
exports.pageAbsUrl = pageAbsUrl;
exports.isHome = isHome;
exports.assetFilepath = assetFilepath;
exports.rt = rt;
exports.rtt = rtt;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _richtypo = require('richtypo');

var _richtypo2 = _interopRequireDefault(_richtypo);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('./util');

// Borrowed from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js
var pluralTypes = {
  en: function en(n) {
    return n !== 1 ? 1 : 0;
  },
  ru: function ru(n) {
    return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
  }
};

/**
 * Localized config option.
 * 
 * @param {String} key Config key: bla.bla.
 * @return {String}
 */

function option(key) {
  var lang = this.lang || 'default';
  var value = _lodash2['default'].get(this.config[lang], key);
  if (value === undefined) {
    throw new Erorr('Config option "' + key + '" not found.');
  }
  return value;
}

/**
 * Page language (`lang` frontmatter field) or default language (`lang` config option) if page language is not specified.
 * 
 * @return {String}
 */

function pageLang() {
  return this.lang || this.option('lang');
}

;

/**
 * Localized config option with {} templates.
 * 
 * @param {String} key Key in config.strings.
 * @param {Object} params Substitutions.
 * @return {String}
 */

function __(key) {
  var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var string = this.option('strings.' + key);
  return (0, _util.tmpl)(string, params);
}

;

/**
 * Plural form of a number.
 *
 * Forms definition:
 *   config:
 *     strings:
 *       posts: post|posts
 *   lang: en
 * 
 * @param {Number} number Number.
 * @param {String} forms Plural forms key in config.strings.
 * @return {String}
 */

function plural(number, formsKey) {
  var formIdx = pluralTypes[this.pageLang()](number);
  var forms = this.__(formsKey).split('|');
  return forms[formIdx];
}

;

/**
 * Proper page URL (don’t do anything, should be overriden).
 * 
 * @param {String} url URL.
 * @return {String}
 */

function pageUrl(url) {
  return url;
}

;

/**
 * Absoule page URL.
 * 
 * @param {String} url URL.
 * @return {String}
 */

function pageAbsUrl(url) {
  var siteUrl = this.option('url');
  siteUrl = siteUrl.replace(/\/$/, '');
  return siteUrl + this.pageUrl(url);
}

;

/**
 * Is current page home page?
 * 
 * @return {Bool}
 */

function isHome() {
  return this.url === '/';
}

;

/**
 * Path for a static file.
 * 
 * @param {String} url
 * @return {String}
 */

function assetFilepath(url) {
  return _path2['default'].join(this.option('assetsFolder'), url);
}

;

/**
 * Fingerprinted URL for a static file.
 * 
 * @param {String} url
 * @return {String}
 */
var fingerprint = _lodash2['default'].memoize(function (url) {
  var datetime = _fs2['default'].statSync(this.assetFilepath(url)).mtime.getTime();
  return url + '?' + datetime;
});

exports.fingerprint = fingerprint;
/**
 * Return a static file content
 * 
 * @param {String} url
 * @return {String}
 */
var embedFile = _lodash2['default'].memoize(function (url) {
  return (0, _util.readFile)(this.assetFilepath(url));
});

exports.embedFile = embedFile;
/**
 * Rich typo for body text.
 * 
 * @param {String} string
 * @return {String}
 */

function rt(string) {
  return string && _richtypo2['default'].rich(string, this.pageLang());
}

;

/**
 * Rich typo for titles.
 * 
 * @param {String} string
 * @return {String}
 */

function rtt(string) {
  return string && _richtypo2['default'].title(string, this.pageLang());
}

;