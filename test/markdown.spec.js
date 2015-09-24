// TODO
var expect = require('chai').expect;

import fs from 'fs';

import renderMarkdown from '../lib/markdown';

// TODO
function readFile(filepath) {
	return fs.readFileSync(filepath, {encoding: 'utf8'});
}

describe('markdown', () => {

	describe('renderer', () => {
		it('should render Markdown string to HTML', () => {
			let result = renderMarkdown(readFile('test/samples/markdown.md'));
			expect(result).to.eql(readFile('test/expected/markdown.html'));
		});
		it('should highlight code in Markdown', () => {
			let result = renderMarkdown(readFile('test/samples/markdown-with-code.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-code.html'));
		});
	});

});
