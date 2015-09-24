import path from 'path';
import assign from 'object-assign';
import fastmatter from 'fastmatter';

import renderMarkdown from './markdown';

export function removeExtension(filename) {
	return filename.replace(/\.\w+$/, '');
}

export function filepathToUrl(filename) {
	return '/' + removeExtension(filename);
}

export function parsePage(source, filepath) {
	let { attributes, body } = fastmatter(source);
	let extension = path.extname(filepath);
	if (extension === '.md') {
		body = renderMarkdown(body);
	}
	return assign(attributes, {
		sourcePath: filepath,
		url: filepathToUrl(filepath),
		content: body
	});
}
