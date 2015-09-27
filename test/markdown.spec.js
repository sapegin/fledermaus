// TODO
var expect = require('chai').expect;

import renderMarkdown from '../lib/markdown';
import { readFile } from '../lib/core';

describe('markdown', () => {

	describe('render', () => {
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
