import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { writeFile } from '../util';

const FILE = path.resolve(__dirname, '../../.cache/sources.json');

let cache = {};
try {
	cache = require(FILE);
} catch (err) {
	// First run
}

const alive = {};

process.on('exit', () => {
	// Remove deleted pages from cache
	cache = _.mapValues(alive, (v, k) => cache[k]);

	writeFile(FILE, JSON.stringify(cache));
});

/**
 * Check if source file has changed since last run.
 *
 * @param {string} pagePath
 * @param {string} content
 * @return {boolean}
 */
export function isSourceUpdated(pagePath) {
	alive[pagePath] = true;

	const date = cache[pagePath] ? cache[pagePath].date : 0;
	const newDate = getDate(pagePath);

	if (date >= newDate) {
		return false;
	}

	cache[pagePath] = {
		date: newDate,
	};

	return true;
}

/**
 * @param {string} pagePath
 * @param {object} data
 */
export function updateSourceCache(pagePath, data) {
	cache[pagePath].data = data;
}

/**
 * @param {string} pagePath
 * @return {object}
 */
export function getSourceFromCache(pagePath) {
	return cache[pagePath].data;
}

/**
 * @param {object} value
 */
export function setSourceCache(value = {}) {
	cache = value;
}

/**
 * @param {string} filepath
 * @return {number}
 */
function getDate(filepath) {
	try {
		return new Date(fs.statSync(filepath).mtime).getTime();
	} catch (err) {
		return 0;
	}
}
