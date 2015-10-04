import ECT from 'ect';
import _ from 'lodash';

const defaultOptions = {
	ext: '.ect',
	root: 'templates'
};

export default function createTemplateRenderer(options = {}) {
	let renderer = ECT(_.merge({}, defaultOptions, options));
	return function render(filepath, locals) {
		return renderer.render(filepath, locals);
	};
}
