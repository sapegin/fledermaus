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
		template = _.upperFirst(template);
		const filepath = path.resolve(options.root, template);
		try {
			let page = require(filepath).default;
			return '<!doctype html>' + page(props);
		}
		catch (e) {
			let error = e.message.replace(options.root, '');
			return errorHtml(`Error while rendering a template "${template}":\n${error}`);
		}
	};
}
