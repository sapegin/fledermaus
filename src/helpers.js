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
	let string = this.option(key);
	let message = getMessageFormat(string, this.pageLang());
	return vdo.markSafe(message.format(params));
}

/**
 * Absolutize URL.
 *
 * @param {string} url URL.
 * @return {string}
 */
export function absolutizeUrl(url) {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url;
	}

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
 * Title to use in a <title> tag.
 *
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
	let format = getDateTimeFormat(this.pageLang(), {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
	try {
		return format.format(date);
	}
	catch (e) {
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
export let fingerprint = _.memoize(function(url) {
	let hash = md5File(this.assetFilepath(url));
	return `${url}?${hash}`;
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

/**
 * Add a fingerprinted or inlined script.
 *
 * @param {object} props
 * @param {string} [props.src] Script source.
 * @param {boolean} [props.inline=false] Inline script.
 * @returns {VDO}
 */
export function Script(props) {
	props = props || {};
	let attrs = {};
	let children;
	if (props.inline) {
		children = this.inlineFile(props.src);
	}
	else if (props.src) {
		attrs.src = this.fingerprint(props.src);
	}
	return vdo('script', attrs, children && vdo.markSafe(children));
}

/**
 * Add a fingerprinted or inlined stylesheet.
 *
 * @param {object} props
 * @param {string} [props.src] Stylesheet source.
 * @param {boolean} [props.inline=false] Inline styles.
 * @returns {VDO}
 */
export function Style(props) {
	props = props || {};
	let attrs = {};
	let children;
	if (props.inline) {
		children = this.inlineFile(props.src);
	}
	else if (props.src) {
		attrs.href = this.fingerprint(props.src);
		attrs.rel = 'stylesheet';
	}
	let tag = children ? 'style' : 'link';
	return vdo(tag, attrs, children && vdo.markSafe(children));
}
