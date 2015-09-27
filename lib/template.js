import ECT from 'ect';

let renderer;

export function init({ root }) {
	renderer = ECT({
		ext: '.ect',
		root
	});
}

export default function render(filepath, locals) {
	return renderer.render(filepath, locals);
}
