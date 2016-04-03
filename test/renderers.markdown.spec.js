import { expect } from 'chai';

import createMarkdownRenderer, { createSimpleMarkdownRenderer, escapeMarkdownInTags, unescapeMarkdown } from '../src/renderers/markdown';
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
		it('should pass children text', () => {
			let render = createMarkdownRenderer({
				customTags: {
					foo: ({ children }) => `<div>${children}</div>\n`
				}
			});
			let result = render(readFile('test/samples/markdown-with-tag-children.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-children.html'));
		});
		it('should treat undefined or null returned from a custom tag as an empty string', () => {
			let render = createMarkdownRenderer({
				customTags: {
					foo: () => null
				}
			});
			let result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-empty.html'));
		});
		it('should return an error message when a custom tag throws', () => {
			let render = createMarkdownRenderer({
				customTags: {
					foo: () => { throw new Error('noooo'); }
				}
			});
			let result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-error.html'));
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

	describe('createSimpleMarkdownRenderer', () => {
		it('should return function', () => {
			let render = createSimpleMarkdownRenderer();
			expect(render).to.be.a.func;
		});
		it('should render Markdown string to HTML', () => {
			let render = createSimpleMarkdownRenderer();
			let result = render(readFile('test/samples/markdown.md'));
			expect(result).to.eql(readFile('test/expected/markdown.html'));
		});
	});

	describe('functions', () => {
		it('escapeMarkdownInTags should escape Markdown in custom tags', () => {
			let result = escapeMarkdownInTags(readFile('test/samples/markdown-with-tag-escape.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-escape.md'));
		});
		it('unescapeMarkdown should unescape Markdown', () => {
			let result = unescapeMarkdown('https:\\/\\/instagram.com\nhttps:\\/\\/facebook.com');
			expect(result).to.eql('https://instagram.com\nhttps://facebook.com');
		});
	});

});
