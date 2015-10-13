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

import fs from 'fs';
import path from 'path';
import richtypo from 'richtypo';
import _ from 'lodash';
import { tmpl, readFile } from './util';

// Borrowed from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js
const pluralTypes = {
	en: n => (n !== 1 ? 1 : 0),
	ru: n => (n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2)
};

/**
 * Localized config option.
 * 
 * @param {String} key Config key: bla.bla.
 * @return {String}
 */
export function option(key) {
	let lang = this.lang || 'default';
	let value = _.get(this.config[lang], key);
	if (value === undefined) {
		throw new Erorr(`Config option "${key}" not found.`);
	}
	return value;
}

/**
 * Page language (`lang` frontmatter field) or default language (`lang` config option) if page language is not specified.
 * 
 * @return {String}
 */
export function pageLang() {
	return this.lang || this.option('lang');
};

/**
 * Localized config option with {} templates.
 * 
 * @param {String} key Key in config.
 * @param {Object} params Substitutions.
 * @return {String}
 */
export function __(key, params = {}) {
	let string = this.option(key);
	return tmpl(string, params);
};

/**
 * Plural form of a number.
 *
 * Forms definition:
 *   config:
 *     posts: post|posts
 *   lang: en
 * 
 * @param {Number} number Number.
 * @param {String} forms Plural forms key in config.
 * @return {String}
 */
export function plural(number, formsKey) {
	let formIdx = pluralTypes[this.pageLang()](number);
	let forms = this.__(formsKey).split('|');
	return forms[formIdx];
};

/**
 * Proper page URL (don’t do anything, should be overriden).
 * 
 * @param {String} url URL.
 * @return {String}
 */
export function pageUrl(url) {
	return url;
};


/**
 * Absoule page URL.
 * 
 * @param {String} url URL.
 * @return {String}
 */
export function pageAbsUrl(url) {
	let siteUrl = this.option('url');
	siteUrl = siteUrl.replace(/\/$/, '');
	return siteUrl + this.pageUrl(url);
};

/**
 * Is current page home page?
 * 
 * @return {Bool}
 */
export function isHome() {
	return this.url === '/';
};

/**
 * Path for a static file.
 * 
 * @param {String} url
 * @return {String}
 */
export function assetFilepath(url) {
	return path.join(this.option('assetsFolder'), url);
};

/**
 * Fingerprinted URL for a static file.
 * 
 * @param {String} url
 * @return {String}
 */
export let fingerprint = _.memoize(function(url) {
	let datetime = fs.statSync(this.assetFilepath(url)).mtime.getTime();
	return `${url}?${datetime}`;
});

/**
 * Return a static file content
 * 
 * @param {String} url
 * @return {String}
 */
export let embedFile = _.memoize(function(url) {
	return readFile(this.assetFilepath(url));
});

/**
 * Rich typo for body text.
 * 
 * @param {String} string
 * @return {String}
 */
export function rt(string) {
	return string && richtypo.rich(string, this.pageLang());
};

/**
 * Rich typo for titles.
 * 
 * @param {String} string
 * @return {String}
 */
export function rtt(string) {
	return string && richtypo.title(string, this.pageLang());
};
