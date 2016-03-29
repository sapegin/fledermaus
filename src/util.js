import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import yaml from 'js-yaml';
import chalk from 'chalk';
import striptags from 'striptags';
import escapeHtml from 'escape-html';
import IntlMessageFormat from 'intl-messageformat';
import { DateTimeFormat } from 'intl';
import createFormatCache from 'intl-format-cache';
import _ from 'lodash';

/* eslint-disable no-console */

const ERROR_COLOR = '#c00';

/**
 * Remove extension from file name.
 *
 * @param {string} filename
 * @return {string}
 */
export function removeExtension(filename) {
	return filename.replace(/\.\w+$/, '');
}

/**
 * Returns extension of a file (without the leading dot).
 *
 * @param {string} filename
 * @return {string}
 */
export function getExtension(filename) {
	return path.extname(filename).substring(1);
}

/**
 * Read text file.
 *
 * @param {string} filepath
 * @return {string}
 */
export function readFile(filepath) {
	return fs.readFileSync(filepath, { encoding: 'utf8' });
}

/**
 * Save text to a file (create all folders if necessary).
 *
 * @param {string} filepath
 * @param {string} content
 * @return {string}
 */
export function writeFile(filepath, content) {
	mkdirp.sync(path.dirname(filepath));
	return fs.writeFileSync(filepath, content, { encoding: 'utf8' });
}

/**
 * Read YAML file.
 *
 * @param {string} filepath
 * @return {string}
 */
export function readYamlFile(filepath) {
	try {
		return yaml.safeLoad(readFile(filepath));
	}
	catch (e) {
		console.log(`Cannot read YAML file ${filepath}:`, e);
	}
}

/**
 * Prepare fields list in short format to _.orderBy()
 * @param {Array} shortFields ['foo', '-bar']
 * @return {Array}
 */
export function formatFieldsForSortByOrder(shortFields) {
	return _.unzip(shortFields.map((field) => {
		if (field[0] === '-') {
			return [field.substr(1), 'desc'];
		}
		return [field, 'asc'];
	}));
}

/**
 * Returns HTML meta tag.
 *
 * @param {string} name Meta name.
 * @param {string} content Meta value.
 * @return {string}
 */
export function meta(name, content) {
	content = cleanHtml(content);
	return `<meta name="${name}" content="${content}">`;
}

/**
 * Returns HTML meta tag for Open Graph.
 *
 * @param {string} name Meta name.
 * @param {string} content Meta value.
 * @return {string}
 */
export function og(name, content) {
	content = cleanHtml(content);
	return `<meta property="${name}" content="${content}">`;
}

/**
 * Return the content of the first paragraph in a given HTML.
 *
 * @param {string} text
 * @return {string}
 */
export function getFirstParagraph(text) {
	let m = text.match(/<p[^>]*>(.*?)<\/p>/i);
	return m && m[1];
}

/**
 * Return the URL of the first image in a given HTML.
 *
 * @param {string} text
 * @return {string}
 */
export function getFirstImage(text) {
	let m = text.match(/<img\s+src=["']([^"']+)["']/i);
	return m && m[1];
}

/**
 * Remove HTML and escape special characters.
 *
 * @param {string} text
 * @return {string}
 */
export function cleanHtml(text) {
	return escapeHtml(striptags(text)).trim();
}

/**
 * Print an error message to console.
 *
 * @param {string} message
 */
export function printError(message) {
	console.error(chalk.red.bold(message));
}

/**
 * Format a message to use in HTML.
 *
 * @param {string} message
 * @return {string}
 */
export function formatErrorHtml(message) {
	return _.escape(message).replace(/\n/g, '<br>');
}

/**
 * Print an error message to a console and return formatted HTML document.
 *
 * @param {string} message
 * @param {string} [file] Source file path.
 * @param {number} [line] Line to highlight in a source file.
 * @return {string}
 */
export function errorHtml(message, file, line) {
	printError(message);
	let code = '';
	if (file && line) {
		code = codeFragment(readFile(file), line);
	}
	return `
		<title>Error</title>
		<body style="background:${ERROR_COLOR}; color:#fff; font-family:Helvetica">
			<h1>Fledermaus error</h1>
			<p>${formatErrorHtml(message)}</p>
			<pre>${code}</pre>
		</body>
	`;
}

/**
 * Print an error message to a console and return formatted HTML string.
 *
 * @param {string} message
 * @return {string}
 */
export function errorInlineHtml(message, { block } = {}) {
	printError(message);
	let html = `<b style="color:${ERROR_COLOR}; font-family:Helvetica">${formatErrorHtml(message)}</b>`;
	if (block) {
		html = `<p>${html}</p>`;
	}
	return html;
}

/**
 * Print code fragment with line numbers.
 *
 * @param {string} code
 * @param {number} line Line to highlight.
 * @return {string}
 */
export function codeFragment(code, line) {
	const contextLines = 2;
	let lines = code.split('\n');
	let begin = Math.max(line - contextLines, 1);
	let end = Math.min(line + contextLines, lines.length);
	lines = lines.slice(begin - 1, end);
	lines = lines.map((str, index) => {
		let currentLineNum = index + begin;
		return [
			currentLineNum === line ? '>' : ' ',
			_.padStart(currentLineNum, 3),
			'|',
			str,
		].join(' ');
	});
	return lines.join('\n');
}

/**
 * Print message immidiately and show execution time on process exit.
 *
 * @param {string} message
 */
export function start(message) {
	console.log(message);
	let startTime = new Date().getTime();

	process.on('exit', () => {
		let time = new Date().getTime() - startTime;
		let minutes = Math.floor(time / 1000 / 60) % 60;
		let seconds = Math.floor(time / 1000) % 60;
		console.log(
			'Done in', (minutes ? `${minutes}m ` : '') + (seconds ? `${seconds}s` : '') +
			(!minutes && !seconds ? 'a moment' : '')
		);
	});
}

/**
 * Intl message formatter.
 *
 * @param {string} format Format string.
 * @param {string} lang Language.
 */
export const getMessageFormat = createFormatCache(IntlMessageFormat);

/**
 * Intl date/time formatter.
 *
 * @param {string} lang Language.
 * @param {Object} format Format.
 */
export const getDateTimeFormat = createFormatCache(DateTimeFormat);
