import { expect } from 'chai';

import createMarkdownRenderer, {
	createSimpleMarkdownRenderer,
	escapeMarkdownInTags,
	unescapeMarkdown,
} from '../src/renderers/markdown';
import { readFile } from '../src/util';

describe('markdown', () => {
	describe('render', () => {
		it('should return function', () => {
			const render = createMarkdownRenderer();
			expect(render).to.be.a.func;
		});
		it('should render Markdown string to HTML', () => {
			const render = createMarkdownRenderer();
			const result = render(readFile('test/samples/markdown.md'));
			expect(result).to.eql(readFile('test/expected/markdown.html'));
		});
		it('should highlight code in Markdown', () => {
			const render = createMarkdownRenderer();
			const result = render(readFile('test/samples/markdown-with-code.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-code.html'));
		});
		it('should render custom tags', () => {
			const render = createMarkdownRenderer({
				customTags: {
					foo: ({ bar }) => `<div>baz ${bar}</div>\n`,
				},
			});
			const result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag.html'));
		});
		it('should pass children text', () => {
			const render = createMarkdownRenderer({
				customTags: {
					foo: ({ children }) => `<div>${children}</div>\n`,
				},
			});
			const result = render(readFile('test/samples/markdown-with-tag-children.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-children.html'));
		});
		it('should treat undefined or null returned from a custom tag as an empty string', () => {
			const render = createMarkdownRenderer({
				customTags: {
					foo: () => null,
				},
			});
			const result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-empty.html'));
		});
		it('should return an error message when a custom tag throws', () => {
			const render = createMarkdownRenderer({
				customTags: {
					foo: () => {
						throw new Error('noooo');
					},
				},
			});
			const result = render(readFile('test/samples/markdown-with-tag.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-error.html'));
		});
		it('should throw if tag function is not specified', () => {
			const func = () => {
				const render = createMarkdownRenderer({
					customTags: {
						notfoo: () => '',
					},
				});
				render(readFile('test/samples/markdown-with-tag.md'));
			};
			expect(func).to.throw;
		});
	});

	describe('createSimpleMarkdownRenderer', () => {
		it('should return function', () => {
			const render = createSimpleMarkdownRenderer();
			expect(render).to.be.a.func;
		});
		it('should render Markdown string to HTML', () => {
			const render = createSimpleMarkdownRenderer();
			const result = render(readFile('test/samples/markdown.md'));
			expect(result).to.eql(readFile('test/expected/markdown.html'));
		});
	});

	describe('functions', () => {
		it('escapeMarkdownInTags should escape Markdown in custom tags', () => {
			const result = escapeMarkdownInTags(readFile('test/samples/markdown-with-tag-escape.md'));
			expect(result).to.eql(readFile('test/expected/markdown-with-tag-escape.md'));
		});
		it('unescapeMarkdown should unescape Markdown', () => {
			const result = unescapeMarkdown('https:\\/\\/instagram.com\nhttps:\\/\\/facebook.com');
			expect(result).to.eql('https://instagram.com\nhttps://facebook.com');
		});
	});
});
