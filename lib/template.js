import ECT from 'ect';
import _ from 'lodash';

const defaultOptions = {
	ext: '.ect',
	root: 'templates'
};

/**
 * Returns function that renders ECT template.
 * 
 * @param {Object} options
 * @return {Function}
 */
export default function createTemplateRenderer(options = {}) {
	let renderer = ECT(_.merge({}, defaultOptions, options));
	return function render(filepath, locals) {
		return renderer.render(filepath, locals);
	};
}
