import _ from 'lodash';
import path from 'path';
import vdo from 'vdo';
import { errorHtml } from '../util';

/* eslint-disable no-console */

// Expose VDO globally so JSX pragma can see it in every template
// Also expose as `h` to allow reusing of component with Preact (Hyperscript)
global.vdo = vdo;
global.h = vdo;

const defaultOptions = {
	root: 'templates',
};

/**
 * Returns function that renders JSX template.
 *
 * @param {object} options
 * @return {Function}
 */
export default function createTemplateRenderer(options = {}) {
	options = _.merge({}, defaultOptions, options);
	return (template, props) => {
		const filepath = path.resolve(options.root, template);
		try {
			const page = require(filepath).default;
			return '<!doctype html>' + vdo.with(props, page);
		}
		catch (exception) {
			const error = exception.message.replace(`${path.resolve(options.root)}/`, '');
			return errorHtml([
				`Error while rendering a page ${props.sourcePath} with a template ${template}:`,
				error,
				exception.stack,
			].join('\n'));
		}
	};
}
