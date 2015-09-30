import ECT from 'ect';
import _ from 'lodash';

const defaultOptions = {
	ext: '.ect',
	root: 'templates'
};

let renderer;

export function init(options = {}) {
	renderer = ECT(_.merge({}, defaultOptions, options));
}

export default function render(filepath, locals) {
	if (!renderer) {
		init();
	}
	return renderer.render(filepath, locals);
}
