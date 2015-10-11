import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import yaml from 'js-yaml';
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
	return path.extname(filename).replace(/^\./, '');
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
 * Simple templates: {key}.
 * 
 * @param {String} template Template.
 * @param {Object} params Substitutions.
 * @return {String}
 */
export function tmpl(template, params = {}) {
	return template.replace(/\{([^\}]+)\}/g, (m, key) => params[key] || m);
}

/**
 * Returns HTML meta tag.
 * 
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */
export function meta(name, content) {
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
	return `<meta property="${name}" content="${content}">`;
}
