import ECT from 'ect';

let renderer;

export function init({ root }) {
	renderer = ECT({
		ext: '.ect',
		root
	});
}

export default function render(filepath, locals) {
	if (!renderer) {
		throw new Error('ECT should be initialized with template.init().');
	}
	return renderer.render(filepath, locals);
}
