/**
 * Context (this):
 * {
 *   config: {base: {}, en: {}, ru: {}},
 *   sourcePath: 'en/mypost.md',
 *   url: 'en/mypost',
 *   content: '...html...',
 *   title: 'My post',
 *   ...frontmatter fields...
 * }
 */

/* eslint no-invalid-this:0 */

import path from 'path';
import richtypo from 'richtypo';
import md5File from 'md5-file';
import vdo from 'vdo';
import _ from 'lodash';
import {
	readFile,
	removeExtension,
	cleanHtml,
	getMessageFormat,
	getDateTimeFormat,
	errorInlineHtml,
	absolutizeUrl as absolutizeUrlBase,
	absolutizeLinks as absolutizeLinksBase,
} from './util';

export {
	safe,
} from './util';

/**
 * Localized config option.
 *
 * @param {string} key Config key: bla.bla.
 * @return {string}
 */
export function option(key) {
	let value = _.get(this.config[this.lang || 'base'], key);
	if (value === undefined) {
		value = this.config[key];
	}
	if (value === undefined) {
		throw new Error(`Config option "${key}" not found.`);
	}
	return value;
}

/**
 * Page language (`lang` frontmatter field) or default language (`lang` config option) if page language is not specified.
 *
 * @return {string}
 */
export function pageLang() {
	return this.lang || this.option('lang');
}

/**
 * Localized config option with {} templates.
 *
 * @param {string} key Key in config.
 * @param {object} params Substitutions.
 * @return {string}
 */
export function __(key, params = {}) {
	const string = this.option(key);
	const message = getMessageFormat(string, this.pageLang());
	return vdo.markSafe(message.format(params));
}

/**
 * Absolutize URL.
 *
 * @param {string} url URL.
 * @return {string}
 */
export function absolutizeUrl(url) {
	return absolutizeUrlBase(url, this.option('url'));
}

/**
 * Absolutize all links and image URLs.
 *
 * @param {string} html
 * @return {string}
 */
export function absolutizeLinks(html) {
	return absolutizeLinksBase(html, this.option('url'));
}

/**
 * Title to use in a <title> tag.
 *
 * @param {Object} $1
 * @param {string} $1.title Custom title.
 * @param {boolean} $1.suffix Do not append suffix if `false`.
 * @return {string}
 */
export function getPageTitle({ title, suffix } = {}) {
	if (this.pageTitle) {
		return this.pageTitle;
	}
	if (title || this.title) {
		if (suffix === undefined) {
			suffix = ' — ' + this.option('title');
		}
		return cleanHtml(title || this.title) + (suffix || '');
	}

	return this.option('title');
}

/**
 * Converts date to string.
 *
 * @param {Date} date
 * @return {string}
 */
export function dateToString(date) {
	const format = getDateTimeFormat(this.pageLang(), {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	try {
		return format.format(date);
	}
	catch (exception) {
		return errorInlineHtml(`dateToString: invalid date "${date}" at ${this.sourcePath}`);
	}
}

/**
 * Path for a static file.
 *
 * @param {string} url
 * @return {string}
 */
export function assetFilepath(url) {
	return path.join(this.option('assetsFolder'), url);
}

/**
 * Fingerprinted URL for a static file.
 *
 * @param {string} url
 * @return {string}
 */
export const fingerprint = _.memoize(function(url) {
	const hash = md5File.sync(this.assetFilepath(url));
	return `${url}?${hash}`;
});

/**
 * Return a static file content.
 *
 * @param {string} url
 * @return {string}
 */
export const embedFile = _.memoize(function(url) {
	return readFile(this.assetFilepath(url));
});


/**
 * Return a static file content prefixed with a comment with a file name.
 *
 * @param {string} url
 * @return {string}
 */
export const inlineFile = _.memoize(function(url) {
	const name = removeExtension(path.basename(url));
	const comment = `/*${name}*/`;
	return comment + readFile(this.assetFilepath(url));
});

/**
 * Rich typo for body text.
 *
 * @param {string} string
 * @return {string}
 */
export function typo(string) {
	return string && vdo.markSafe(richtypo.rich(string.toString(), this.pageLang()));
}

/**
 * Rich typo for titles.
 *
 * @param {string} string
 * @return {string}
 */
export function typoTitle(string) {
	return string && vdo.markSafe(richtypo.title(string.toString(), this.pageLang()));
}

/**
 * Stringify JSON.
 * @param {object} object
 * @return {string}
 */
export function json(object) {
	return vdo.markSafe(JSON.stringify(object));
}
