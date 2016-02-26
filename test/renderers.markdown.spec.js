import { expect } from 'chai';

import createMarkdownRenderer from '../src/renderers/markdown';
import { readFile } from '../src/util';

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
		it('should render custom tags', () => {
			let render = createMarkdownRenderer({
				customTags: {
					foo: ({ bar }) => `<div>baz ${bar}</div>\n`
				}
			});
			let result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag.html'));
		});
		it('should throw if tag function is not specified', () => {
			let func = () => {
				let render = createMarkdownRenderer({
					customTags: {
						notfoo: () => ''
					}
				});
				render(readFile('test/samples/markdown-with-tag.md'));
			};
			expect(func).to.throw;
		});
	});

});
