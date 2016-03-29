import ECT from 'ect';
import _ from 'lodash';
import { errorHtml } from '../util';

/* eslint-disable no-console */

const defaultOptions = {
	ext: '.ect',
	root: 'templates',
};

/**
 * Returns function that renders ECT template.
 *
 * @param {object} options
 * @return {Function}
 */
export default function createTemplateRenderer(options = {}) {
	let renderer = ECT(_.merge({}, defaultOptions, options));
	return function render(filepath, locals) {
		try {
			return renderer.render(filepath, locals);
		}
		catch (e) {
			let m = e.message.match(/in (.*?\.ect) on line (\d+)/);
			return errorHtml(`Error while rendering a template "${filepath}":\n${e.message}`, m && m[1], m && m[2]);
		}
	};
}
