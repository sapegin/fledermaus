import { expect } from 'chai';
import rimraf from 'rimraf';

import * as core from '../lib/core';
import { readFile } from '../lib/util';
import createTemplateRenderer from '../lib/renderers/template';
import createMarkdownRenderer from '../lib/renderers/markdown';

let renderTemplate = createTemplateRenderer({
	root: 'test/samples'
});
let renderMarkdown = createMarkdownRenderer();

// console.log(JSON.stringify(result));

describe('core', () => {

	describe('filepathToUrl', () => {
		it('should transform file path to relative URL', () => {
			let result = core.filepathToUrl('ru/markdown.md');
			expect(result).to.eql('/ru/markdown');
		});
	});

	describe('parsePage', () => {
		it('should parse Markdown source with frontmatter to an object', () => {
			let filepath = 'test/samples/markdown-with-frontmatter.md';
			let result = core.parsePage(readFile(filepath), filepath, renderMarkdown);
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.md.json'));
		});
		it('should parse HTML source with frontmatter to an object', () => {
			let filepath = 'test/samples/markdown-with-frontmatter.html';
			let result = core.parsePage(readFile(filepath), filepath, renderMarkdown);
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.html.json'));
		});
	});

	describe('getSourceFilesList', () => {
		it('should return a list of source files', () => {
			let result = core.getSourceFilesList('test/source');
			expect(result).to.eql([
				'test/source/en/plugins-requirejs.md',
				'test/source/en/read-less-tech-books.md',
				'test/source/ru/debug-mode.md'
			]);
		});
	});

	describe('loadSourceFiles', () => {
		it('should return an object with parsed source files', () => {
			let result = core.loadSourceFiles('test/source');
			expect(result).to.eql(require('./expected/files.json'));
		});
	});

	describe('getConfigFilesList', () => {
		it('should return a list of config files', () => {
			let result = core.getConfigFilesList('test/config');
			expect(result).to.eql([
				'test/config/default.yml',
				'test/config/en.yml',
				'test/config/ru.yml'
			]);
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files to an object', () => {
			let result = core.readConfigFiles([
				'test/config/default.yml'
			]);
			expect(result).to.eql(require('./expected/configs.json'));
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files (with langs) to an object', () => {
			let result = core.readConfigFiles([
				'test/config/default.yml',
				'test/config/en.yml',
				'test/config/ru.yml'
			]);
			expect(result).to.eql(require('./expected/configs-langs.json'));
		});
	});

	describe('mergeConfigs', () => {
		it('should merge config objects', () => {
			let result = core.mergeConfigs(require('./expected/configs.json'));
			expect(result).to.eql(require('./expected/configs-merged.json'));
		});
	});

	describe('mergeConfigs', () => {
		it('should merge config objects (with langs)', () => {
			let result = core.mergeConfigs(require('./expected/configs-langs.json'));
			expect(result).to.eql(require('./expected/configs-langs-merged.json'));
		});
	});

	describe('loadConfig', () => {
		it('should return merged config object', () => {
			let result = core.loadConfig('test/config');
			expect(result).to.eql(require('./expected/configs-langs-merged.json'));
		});
	});

	describe('makeContext', () => {
		it('should return merged config object', () => {
			let result = core.makeContext({
				title: 'Hello',
				content: '<b>Test</b>'
			}, {
				default: {
					title: 'Blog',
					author: 'Artem Sapegin'
				}
			}, {
				siteTitle: function() { return this.config.default.title },
				heading: function(l) { return `<h${l}>${this.title}</h${l}>` }
			});
			expect(result.title).to.eql('Hello');
			expect(result.config.default.title).to.eql('Blog');
			expect(result.siteTitle()).to.eql('Blog');
			expect(result.heading(2)).to.eql('<h2>Hello</h2>');
		});
	});

	describe('generatePage', () => {
		it('should render page using template from frontmatter', () => {
			let result = core.generatePage({
				title: 'Hello',
				layout: 'layout',
				sourcePath: 'all/post',
				content: '<b>Test</b>'
			}, {
				default: {}
			}, {
			}, renderTemplate);
			expect(result.content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result.pagePath).to.eql('all/post');
		});
	});

	describe('generatePages', () => {
		it('should render array of pages', () => {
			let result = core.generatePages([
				{
					title: 'Hello',
					layout: 'layout',
					sourcePath: 'all/post',
					content: '<b>Test</b>'
				},
				{
					title: 'Bye',
					layout: 'layout',
					sourcePath: 'all/post2',
					content: '<b>Foobarbaz</b>'
				}
			], {
				default: {}
			}, {
			}, renderTemplate);
			expect(result.length).to.eql(2);
			expect(result[0].content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result[0].pagePath).to.eql('all/post');
			expect(result[1].content).to.eql('<h1>Bye</h1>\n<b>Foobarbaz</b>');
			expect(result[1].pagePath).to.eql('all/post2');
		});
	});

	describe('savePage', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should save page to HTML file', () => {
			core.savePage({
				pagePath: 'all/post',
				content: '<h1>Hello</h1>\n<b>Test</b>'
			}, 'test/tmp');
			expect(readFile('test/tmp/all/post.html')).to.eql('<h1>Hello</h1>\n<b>Test</b>');
		});
	});

	describe('savePages', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should save array of page to HTML files', () => {
			core.savePages([
				{
					pagePath: 'all/post',
					content: '<h1>Hello</h1>\n<b>Test</b>'
				},
				{
					pagePath: 'all/post2',
					content: '<h1>Bye</h1>\n<b>Foobarbaz</b>'
				}
			], 'test/tmp');
			expect(readFile('test/tmp/all/post.html')).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(readFile('test/tmp/all/post2.html')).to.eql('<h1>Bye</h1>\n<b>Foobarbaz</b>');
		});
	});

});
