import { expect } from 'chai';

import createMarkdownRenderer from '../lib/markdown';
import { readFile } from '../lib/util';

describe('markdown', () => {

	describe('render', () => {
		it('should return function', () => {
			let render = createMarkdownRenderer();
			expect(render).to.be.a.func;
		});
		it('should render Markdown string to HTML', () => {
			let render = createMarkdownRenderer();
			let result = render(readFile('test/samples/markdown.md'));
			expect(result).to.eql(readFile('test/expected/markdown.html'));
		});
		it('should highlight code in Markdown', () => {
			let render = createMarkdownRenderer();
			let result = render(readFile('test/samples/markdown-with-code.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-code.html'));
		});
	});

});
