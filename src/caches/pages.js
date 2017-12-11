import path from 'path';
import _ from 'lodash';
import hashSum from 'hash-sum';
import { writeFile } from '../util';

const FILE = path.join(__dirname, '.cahe/pages.json');

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
 * Check if generated page has different content since last run.
 *
 * @param {string} pagePath
 * @param {string} content
 * @return {boolean}
 */
function isPageUpdated(pagePath, content) {
	alive[pagePath] = true;

	const hash = cache[pagePath];
	const newHash = hashSum(content);

	if (newHash === hash) {
		return false;
	}

	cache[pagePath] = newHash;

	return true;
}

export default isPageUpdated;
