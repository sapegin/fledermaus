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

import _ from 'lodash';
import { tmpl } from './util';

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
	return _.get(this.config[lang], key);
}

/**
 * Localized config option with {} templates.
 * 
 * @param {String} key Key in config.strings.
 * @param {Object} params Substitutions.
 * @return {String}
 */
export function __(key, params = {}) {
	let string = this.option(`strings.${key}`);
	return tmpl(string, params);
};

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
export function plural(number, formsKey) {
	let formIdx = pluralTypes[this.lang](number);
	let forms = this.__(formsKey).split('|');
	return forms[formIdx];
};
