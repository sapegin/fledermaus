import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import yaml from 'js-yaml';
import strip from 'strip';
import escapeHtml from 'escape-html';
import _ from 'lodash';

/**
 * Remove extension from file name.
 *
 * @param {String} filename
 * @return {String}
 */
export function removeExtension(filename) {
	return filename.replace(/\.\w+$/, '');
}

/**
 * Returns extension of a file (without the leading dot).
 *
 * @param {String} filename
 * @return {String}
 */
export function getExtension(filename) {
	return path.extname(filename).substring(1);
}

/**
 * Read text file.
 *
 * @param {String} filepath
 * @return {String}
 */
export function readFile(filepath) {
	return fs.readFileSync(filepath, {encoding: 'utf8'});
}

/**
 * Save text to a file (create all folders if necessary).
 *
 * @param {String} filepath
 * @param {String} content
 * @return {String}
 */
export function writeFile(filepath, content) {
	mkdirp.sync(path.dirname(filepath));
	return fs.writeFileSync(filepath, content, {encoding: 'utf8'});
}

/**
 * Read YAML file.
 *
 * @param {String} filepath
 * @return {String}
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
 * Prepare fields list in short format to _.sortByOrder()
 * @param {Array} shortFields ['foo', '-bar']
 * @return {Array}
 */
export function formatFieldsForSortByOrder(shortFields) {
	return _.unzip(shortFields.map((field) => {
		if (field[0] === '-') {
			return [field.substr(1), 'desc'];
		}
		else {
			return [field, 'asc'];
		}
	}));
}

/**
 * Returns HTML meta tag.
 *
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */
export function meta(name, content) {
	content = cleanHtml(content);
	return `<meta name="${name}" content="${content}">`;
}

/**
 * Returns HTML meta tag for Open Graph.
 *
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */
export function og(name, content) {
	content = cleanHtml(content);
	return `<meta property="${name}" content="${content}">`;
}

/**
 * Return the content of the first paragraph in a given HTML.
 *
 * @param {String} text
 * @return {String}
 */
export function getFirstParagraph(text) {
	let m = text.match(/<p[^>]*>(.*?)<\/p>/i);
	return m && m[1];
}

/**
 * Return the URL of the first image in a given HTML.
 *
 * @param {String} text
 * @return {String}
 */
export function getFirstImage(text) {
	let m = text.match(/<img\s+src=["']([^"']+)["']/i);
	return m && m[1];
}

/**
 * Remove HTML and escape special characters.
 *
 * @param {String} text
 * @return {String}
 */
export function cleanHtml(text) {
	return escapeHtml(
		strip(text)
	);
}

/**
 * Print message immidiately and show execution time on process exit.
 *
 * @param {String} message
 */
export function start(message) {
	console.log(message);
	let startTime = new Date().getTime();

	process.on('exit', () => {
		let time = new Date().getTime() - startTime;
		let minutes = Math.floor(time / 1000 / 60) % 60;
		let seconds = Math.floor(time / 1000) % 60;
		console.log('Done in', (minutes ? `${minutes}m ` : '') + (seconds ? `${seconds}s` : '') + (!minutes && !seconds ? 'a moment' : ''));
	});
}
