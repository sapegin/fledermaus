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

import fs from 'fs';
import path from 'path';
import richtypo from 'richtypo';
import IntlMessageFormat from 'intl-messageformat';
import { DateTimeFormat } from 'intl';
import createFormatCache from 'intl-format-cache';
import _ from 'lodash';
import { readFile, removeExtension } from './util';

let getMessageFormat = createFormatCache(IntlMessageFormat);
let getDateTimeFormat = createFormatCache(DateTimeFormat);

/**
 * Localized config option.
 *
 * @param {string} key Config key: bla.bla.
 * @return {string}
 */
export function option(key) {
	let lang = this.lang || 'base';
	let value = _.get(this.config[lang], key);
	if (value === undefined) {
		throw new Error(`Config option "${lang}/${key}" not found.`);
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
	let string = this.option(key);
	let message = getMessageFormat(string, this.pageLang());
	return message.format(params);
}

/**
 * Absolutize URL.
 *
 * @param {string} url URL.
 * @return {string}
 */
export function absolutizeUrl(url) {
	let siteUrl = this.option('url');
	siteUrl = siteUrl.replace(/\/$/, '');
	url = url.replace(/^\//, '');
	return `${siteUrl}/${url}`;
}

/**
 * Absolutize all links and image URLs.
 *
 * @param {string} html
 * @return {string}
 */
export function absolutizeLinks(html) {
	let url = this.option('url');
	return html && (html
		.replace(/href="\//g, 'href="' + url + '/')
		.replace(/src="\//g, 'src="' + url + '/')
	);
}

/**
 * Is current page home page?
 *
 * @return {boolean}
 */
export function isHome() {
	return this.url === '/';
}

/**
 * Converts date to string.
 *
 * @param {Date} date
 * @return {string}
 */
export function dateToString(date) {
	let format = getDateTimeFormat(this.pageLang(), {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	return format.format(date);
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
export let fingerprint = _.memoize(function(url) {
	let datetime = fs.statSync(this.assetFilepath(url)).mtime.getTime();
	return `${url}?${datetime}`;
});

/**
 * Return a static file content.
 *
 * @param {string} url
 * @return {string}
 */
export let embedFile = _.memoize(function(url) {
	return readFile(this.assetFilepath(url));
});


/**
 * Return a static file content prefixed with a comment with a file name.
 *
 * @param {string} url
 * @return {string}
 */
export let inlineFile = _.memoize(function(url) {
	let name = removeExtension(path.basename(url));
	let comment = `/*${name}*/`;
	return comment + readFile(this.assetFilepath(url));
});

/**
 * Rich typo for body text.
 *
 * @param {string} string
 * @return {string}
 */
export function rt(string) {
	return string && richtypo.rich(string, this.pageLang());
}

/**
 * Rich typo for titles.
 *
 * @param {string} string
 * @return {string}
 */
export function rtt(string) {
	return string && richtypo.title(string, this.pageLang());
}
