import { expect } from 'chai';
import path from 'path';
import rimraf from 'rimraf';
import _ from 'lodash';

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

	describe('parseCustomFields', () => {
		it('should return attributes with parsed custom fields', () => {
			let ddd = {title: 'Post', date: 'Nov 8, 2013'};
			let result = core.parseCustomFields(ddd, {
				date: Date.parse
			});
			expect(result.title).to.eql('Post');
			expect((new Date(result.date)).toDateString()).to.eql('Fri Nov 08 2013');
		});
		it('should be able to create new attributes', () => {
			let ddd = {title: 'Post', date: 'Nov 8, 2013'};
			let result = core.parseCustomFields(ddd, {
				timestamp: (t, attrs) => Date.parse(attrs.date),
				date: (d) => new Date(Date.parse(d))
			});
			expect(result.title).to.eql('Post');
			expect((new Date(result.timestamp)).toDateString()).to.eql('Fri Nov 08 2013');
			expect(result.date.toDateString()).to.eql('Fri Nov 08 2013');
		});
	});

	describe('parsePage', () => {
		let renderers = {md: renderMarkdown};
		it('should parse Markdown source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.md';
			let result = core.parsePage(readFile(path.join(folder, filepath)), filepath, { renderers });
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.md.js'));
		});
		it('should modify all fields using custom field parsers', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.md';
			let result = core.parsePage(readFile(path.join(folder, filepath)), filepath, {
				renderers,
				fieldParsers: {
					lang: () => 'ru',
					url: (u) => `/ru${u}`
				}
			});
			expect(result).to.eql(require('./expected/markdown-with-custom-fields.js'));
		});
		it('should split content to excerpt and more if cut tag is used', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-cut.md';
			let result = core.parsePage(readFile(path.join(folder, filepath)), filepath, {
				cutTag: '<!-- cut -->',
				renderers
			});
			expect(result).to.eql(require('./expected/markdown-with-cut.md.js'));
		});
		it('should parse HTML source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.html';
			let result = core.parsePage(readFile(path.join(folder, filepath)), filepath, { renderers });
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.html.js'));
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
			let result = core.loadSourceFiles('test/source', ['md', 'html'], {renderers: {md: renderMarkdown}});
			expect(result).to.eql(require('./expected/files.js'));
		});
	});

	describe('getConfigFilesList', () => {
		it('should return a list of config files', () => {
			let result = core.getConfigFilesList('test/config');
			expect(result).to.eql([
				'test/config/base.yml',
				'test/config/en.yml',
				'test/config/ru.yml'
			]);
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files to an object', () => {
			let result = core.readConfigFiles([
				'test/config/base.yml'
			]);
			expect(result).to.eql(require('./expected/configs.json'));
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files (with langs) to an object', () => {
			let result = core.readConfigFiles([
				'test/config/base.yml',
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
				base: {
					title: 'Blog',
					author: 'Artem Sapegin'
				}
			}, {
				siteTitle: function() { return this.config.base.title },
				heading: function(l) { return `<h${l}>${this.title}</h${l}>` }
			});
			expect(result.title).to.eql('Hello');
			expect(result.config.base.title).to.eql('Blog');
			expect(result.siteTitle()).to.eql('Blog');
			expect(result.heading(2)).to.eql('<h2>Hello</h2>');
		});
	});

	describe('filterDocuments', () => {
		it('should filter documents by field value', () => {
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
			], {lang: 'ru'});
			expect(result.length).to.eql(2);
			expect(result[0].title).to.eql('Post 2');
		});
		it('should filter documents by RegExp', () => {
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
			], {sourcePath: /^all\//});
			expect(result.length).to.eql(2);
			expect(result[0].title).to.eql('Post 1');
		});
		it('should filter documents by multiple fields', () => {
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
			], {title: 'Post 1', sourcePath: /^all\//});
			expect(result.length).to.eql(1);
			expect(result[0].title).to.eql('Post 1');
		});
	});

	describe('orderDocuments', () => {
		it('should sort array of documents', () => {
			let result = core.orderDocuments([
				{
					title: 'Post 2',
					sourcePath: 'all/post2.md'
				},
				{
					title: 'Post 1',
					sourcePath: 'all/post1.md'
				},
				{
					title: 'About',
					sourcePath: 'about.md'
				}
			], ['title']);
			expect(_.pluck(result, 'title')).to.eql(['About', 'Post 1', 'Post 2']);
		});
		it('should sort array of documents backwards', () => {
			let result = core.orderDocuments([
				{
					title: 'Post 2',
					sourcePath: 'all/post2.md'
				},
				{
					title: 'Post 1',
					sourcePath: 'all/post1.md'
				},
				{
					title: 'About',
					sourcePath: 'about.md'
				}
			], ['-title']);
			expect(_.pluck(result, 'title')).to.eql(['Post 2', 'Post 1', 'About']);
		});
		it('should sort array by miltiple fields', () => {
			let result = core.orderDocuments([
				{
					title: 'Post 1',
					sourcePath: 'all/post1.md',
					layout: 'post'
				},
				{
					title: 'About',
					sourcePath: 'about.md',
					layout: 'about'
				},
				{
					title: 'Post 2',
					sourcePath: 'all/post2.md',
					layout: 'post'
				}
			], ['-layout', 'title']);
			expect(_.pluck(result, 'title')).to.eql(['Post 1', 'Post 2', 'About']);
		});
	});

	describe('groupDocuments', () => {
		it('should group documents by a single value', () => {
			let result = core.groupDocuments([
				{
					title: 'Post 1',
					layout: 'post'
				},
				{
					title: 'Post 2',
					layout: 'post'
				},
				{
					title: 'About',
					layout: 'about'
				}
			], 'layout');
			expect(result).to.eql({
				post: [
					{title: 'Post 1', layout: 'post'},
					{title: 'Post 2', layout: 'post'}
				],
				about: [
					{title: 'About', layout: 'about'}
				]
			});
		});
		it('should group documents by every item if the value is an array', () => {
			let result = core.groupDocuments([
				{
					title: 'Post 1',
					tags: 'foo'
				},
				{
					title: 'Post 2',
					tags: ['bar', 'foo']
				},
				{
					title: 'Post 3',
					tags: ['foo']
				}
			], 'tags');
			expect(result).to.eql({
				foo: [
					{title: 'Post 1', tags: 'foo'},
					{title: 'Post 2', tags: ['bar', 'foo']},
					{title: 'Post 3', tags: ['foo']}
				],
				bar: [
					{title: 'Post 2', tags: ['bar', 'foo']},
				]
			});
		});
		it('should skip document if the field value is undefined', () => {
			let result = core.groupDocuments([
				{
					title: 'Post 1',
					layout: 'post'
				},
				{
					title: 'Post 2'
				},
				{
					title: 'About',
					layout: 'about'
				}
			], 'layout');
			expect(result).to.eql({
				post: [
					{title: 'Post 1', layout: 'post'}
				],
				about: [
					{title: 'About', layout: 'about'}
				]
			});
		});
		it('should group documents by the result of function call', () => {
			let result = core.groupDocuments([
				{
					title: 'Post 1',
					date: '2014-06-17'
				},
				{
					title: 'Post 2',
					date: '2015-09-01'
				},
				{
					title: 'About',
					date: '2014-01-12'
				}
			], d => Number(d.date.split('-')[0]));
			expect(result).to.eql({
				2014: [
					{title: 'Post 1', date: '2014-06-17'},
					{title: 'About', date: '2014-01-12'}
				],
				2015: [
					{title: 'Post 2', date: '2015-09-01'}
				]
			});
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
				base: {}
			}, {
			}, {ect: renderTemplate});
			expect(result.content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result.pagePath).to.eql('all/post.html');
		});
		it('should use layout extension if it is specified (feed.xml.ect → feed.xml)', () => {
			let result = core.generatePage({
				title: 'Hello',
				layout: 'layout.xml',
				sourcePath: 'all/feed.md',
				content: '<b>Test</b>'
			}, {
				base: {}
			}, {
			}, {ect: renderTemplate});
			expect(result.content).to.eql('<foo><b>Test</b></foo>\n');
			expect(result.pagePath).to.eql('all/feed.xml');
		});
		it('should throw if layout is not specified', () => {
			let func = () => {
				core.generatePage({
					title: 'Hello',
					sourcePath: 'all/post.md',
					content: '<b>Test</b>'
				}, {
					base: {}
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
				base: {}
			}, {
			}, {ect: renderTemplate});
			expect(result.length).to.eql(2);
			expect(result[0].content).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(result[0].pagePath).to.eql('all/post.html');
			expect(result[1].content).to.eql('<h1>Bye</h1>\n<b>Foobarbaz</b>');
			expect(result[1].pagePath).to.eql('all/post2.html');
		});
	});

	describe('getPageNumberUrl', () => {
		it('should return pagination page number', () => {
			let result = core.getPageNumberUrl('all', 5);
			expect(result).to.eql('all/page/5');
		});
		it('should return URL prefix for the first page', () => {
			let result = core.getPageNumberUrl('all', 1);
			expect(result).to.eql('all');
		});
		it('should add index if index options is true', () => {
			let result = core.getPageNumberUrl('all', 1, {index: true});
			expect(result).to.eql('all/index');
		});
		it('should not return double slash: page number', () => {
			let result = core.getPageNumberUrl('/', 5);
			expect(result).to.eql('/page/5');
		});
		it('should not return double slash: first page', () => {
			let result = core.getPageNumberUrl('/', 1);
			expect(result).to.eql('/');
		});
		it('should not return double slash: index', () => {
			let result = core.getPageNumberUrl('/', 1, {index: true});
			expect(result).to.eql('/index');
		});
	});

	describe('paginate', () => {
		it('should return an array of documents with pagination info', () => {
			let result = core.paginate(
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
					sourcePathPrefix: 'all',
					urlPrefix: '/all',
					documentsPerPage: 3,
					layout: 'pagination'
				}
			);
			expect(result).to.eql(require('./expected/pagination.json'));
		});
		it('should add extra options to every generated document', () => {
			let result = core.paginate(
				[
					{ title: 'Post 1', layout: 'post', sourcePath: 'all/post1.md', content: '<b>1</b>'},
					{ title: 'Post 2', layout: 'post', sourcePath: 'all/post2.md', content: '<b>2</b>'}
				],
				{
					sourcePathPrefix: 'all',
					urlPrefix: '/all',
					documentsPerPage: 1,
					layout: 'pagination',
					extra: {
						foo: 42,
						bar: 13
					}
				}
			);
			expect(result[0].foo).to.eql(42);
			expect(result[1].bar).to.eql(13);
		});
	});

	describe('savePage', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should save page to HTML file', () => {
			core.savePage({
				pagePath: 'all/post.html',
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
					pagePath: 'all/post.html',
					content: '<h1>Hello</h1>\n<b>Test</b>'
				},
				{
					pagePath: 'all/post2.html',
					content: '<h1>Bye</h1>\n<b>Foobarbaz</b>'
				}
			], 'test/tmp');
			expect(readFile('test/tmp/all/post.html')).to.eql('<h1>Hello</h1>\n<b>Test</b>');
			expect(readFile('test/tmp/all/post2.html')).to.eql('<h1>Bye</h1>\n<b>Foobarbaz</b>');
		});
	});

});
