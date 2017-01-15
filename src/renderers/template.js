import _ from 'lodash';
import path from 'path';
import vdo from 'vdo';
import { errorHtml } from '../util';

/* eslint-disable no-console */

// Expose VDO globally so JSX pragma can see it in every template
global.vdo = vdo;

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
			let page = require(filepath).default;
			return '<!doctype html>' + vdo.with(props, page);
		}
		catch (exception) {
			let error = exception.message.replace(`${path.resolve(options.root)}/`, '');
			return errorHtml([
				`Error while rendering a page ${props.sourcePath} with a template ${template}:`,
				error,
				exception.stack,
			].join('\n'));
		}
	};
}
