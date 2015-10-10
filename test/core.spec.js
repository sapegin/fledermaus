import { expect } from 'chai';
import path from 'path';
import rimraf from 'rimraf';

import * as core from '../src/core';
import { readFile } from '../src/util';
import createTemplateRenderer from '../src/renderers/template';
import createMarkdownRenderer from '../src/renderers/markdown';

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
		it('should strip "index" at the end', () => {
			let result = core.filepathToUrl('ru/index.md');
			expect(result).to.eql('/ru');
		});
		it('should return "/" if "index" is the only part of URL', () => {
			let result = core.filepathToUrl('index.md');
			expect(result).to.eql('/');
		});
	});

	describe('renderByType', () => {
		it('should render string using a renderer that matches the file extension', () => {
			let result = core.renderByType('Hello *Markdown*!', 'test.md', {md: renderMarkdown});
			expect(result).to.eql('<p>Hello <em>Markdown</em>!</p>\n');
		});
		it('should return source string if no matching renderer found', () => {
			let result = core.renderByType('<p>Hello <em>HTML</em>!</p>', 'test.html', {md: renderMarkdown});
			expect(result).to.eql('<p>Hello <em>HTML</em>!</p>');
		});
	});

	describe('parsePage', () => {
		it('should parse Markdown source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.md';
			let result = core.parsePage(readFile(path.join(folder, filepath)), folder, filepath, {md: renderMarkdown});
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.md.json'));
		});
		it('should parse HTML source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.html';
			let result = core.parsePage(readFile(path.join(folder, filepath)), folder, filepath, {md: renderMarkdown});
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.html.json'));
		});
	});

	describe('getSourceFilesList', () => {
		it('should return a list of source files', () => {
			let result = core.getSourceFilesList('test/source', ['md', 'html']);
			expect(result).to.eql([
				'en/plugins-requirejs.md',
				'en/read-less-tech-books.md',
				'ru/debug-mode.md'
			]);
		});
	});

	describe('loadSourceFiles', () => {
		it('should return an object with parsed source files', () => {
			let result = core.loadSourceFiles('test/source', ['md', 'html'], {md: renderMarkdown});
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

	describe('filterDocuments', () => {
		it('should return filtered array of documents', () => {
			let result = core.filterDocuments([
				{
					title: 'Post 1',
					sourcePath: 'all/post1.md'
				},
				{
					title: 'Post 2',
					sourcePath: 'all/post2.md'
				},
				{
					title: 'About',
					sourcePath: 'about.md'
				}
			], /^all\//);
			expect(result.length).to.eql(2);
			expect(result[0].title).to.eql('Post 1');
		});
		it('should filter documents by language', () => {
			let result = core.filterDocuments([
				{
					title: 'Post 1',
					sourcePath: 'all/post1.md',
					lang: 'en'
				},
				{
					title: 'Post 2',
					sourcePath: 'all/post2.md',
					lang: 'ru'
				},
				{
					title: 'About',
					sourcePath: 'about.md',
					lang: 'ru'
				}
			], /^all\//, 'ru');
			expect(result.length).to.eql(1);
			expect(result[0].title).to.eql('Post 2');
		});
	});

	describe('generatePage', () => {
		it('should render page using template from frontmatter', () => {
			let result = core.generatePage({
				title: 'Hello',
				layout: 'layout',
				sourcePath: 'all/post.md',
				content: '<b>Test</b>'
			}, {
				default: {}
			}, {
			}, {ect: renderTemplate});
			expect(result.content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result.pagePath).to.eql('all/post');
		});
		it('should throw if layout is not specified', () => {
			let func = () => {
				core.generatePage({
					title: 'Hello',
					sourcePath: 'all/post.md',
					content: '<b>Test</b>'
				}, {
					default: {}
				}, {
				}, {ect: renderTemplate});
			}
			expect(func).to.throw;
		});
	});

	describe('generatePages', () => {
		it('should render array of pages', () => {
			let result = core.generatePages([
				{
					title: 'Hello',
					layout: 'layout',
					sourcePath: 'all/post.md',
					content: '<b>Test</b>'
				},
				{
					title: 'Bye',
					layout: 'layout',
					sourcePath: 'all/post2.md',
					content: '<b>Foobarbaz</b>'
				}
			], {
				default: {}
			}, {
			}, {ect: renderTemplate});
			expect(result.length).to.eql(2);
			expect(result[0].content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result[0].pagePath).to.eql('all/post');
			expect(result[1].content).to.eql('<h1>Bye</h1>\n<b>Foobarbaz</b>');
			expect(result[1].pagePath).to.eql('all/post2');
		});
	});

	describe('getPageNumberUrl', () => {
		it('should return pagination page number', () => {
			let result = core.getPageNumberUrl('all', 5);
			expect(result).to.eql('all/page/5');
		});
	});

	describe('generatePagination', () => {
		it('should return an array of pages with pagination info', () => {
			let result = core.generatePagination(
				[
					{ title: 'Post 1', layout: 'post', sourcePath: 'all/post1.md', content: '<b>1</b>'},
					{ title: 'Post 2', layout: 'post', sourcePath: 'all/post2.md', content: '<b>2</b>'},
					{ title: 'Post 3', layout: 'post', sourcePath: 'all/post3.md', content: '<b>3</b>'},
					{ title: 'Post 4', layout: 'post', sourcePath: 'all/post4.md', content: '<b>4</b>'},
					{ title: 'Post 5', layout: 'post', sourcePath: 'all/post5.md', content: '<b>5</b>'},
					{ title: 'Post 6', layout: 'post', sourcePath: 'all/post6.md', content: '<b>6</b>'},
					{ title: 'Post 7', layout: 'post', sourcePath: 'all/post7.md', content: '<b>7</b>'},
					{ title: 'Post 8', layout: 'post', sourcePath: 'all/post8.md', content: '<b>8</b>'},
					{ title: 'Post 9', layout: 'post', sourcePath: 'all/post9.md', content: '<b>9</b>'},
					{ title: 'Post 10', layout: 'post', sourcePath: 'all/post10.md', content: '<b>10</b>'}
				],
				{
					urlPrefix: '/all',
					documentsPerPage: 3,
					layout: 'pagination'
				}
			);
			expect(result).to.eql(require('./expected/pagination.json'));
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
