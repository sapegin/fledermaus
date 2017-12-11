import path from 'path';
import rimraf from 'rimraf';
import _ from 'lodash';

import * as core from '../src/core';
import { readFile } from '../src/util';
import * as helpers from '../src/helpers';
import createTemplateRenderer from '../src/renderers/template';
import createMarkdownRenderer from '../src/renderers/markdown';

/* eslint-disable object-shorthand, object-property-newline */

const renderTemplate = createTemplateRenderer({
	root: 'test/samples',
});
const renderMarkdown = createMarkdownRenderer();

// console.log(JSON.stringify(result));

describe('core', () => {
	describe('filepathToUrl', () => {
		it('should transform file path to relative URL', () => {
			const result = core.filepathToUrl('ru/markdown.md');
			expect(result).toEqual('/ru/markdown');
		});
		it('should strip "index" at the end', () => {
			const result = core.filepathToUrl('ru/index.md');
			expect(result).toEqual('/ru');
		});
		it('should return "/" if "index" is the only part of URL', () => {
			const result = core.filepathToUrl('index.md');
			expect(result).toEqual('/');
		});
	});

	describe('renderByType', () => {
		it('should render string using a renderer that matches the file extension', () => {
			const result = core.renderByType('Hello *Markdown*!', 'test.md', { md: renderMarkdown });
			expect(result).toEqual('<p>Hello <em>Markdown</em>!</p>\n');
		});
		it('should return source string if no matching renderer found', () => {
			const result = core.renderByType('<p>Hello <em>HTML</em>!</p>', 'test.html', {
				md: renderMarkdown,
			});
			expect(result).toEqual('<p>Hello <em>HTML</em>!</p>');
		});
	});

	describe('parseCustomFields', () => {
		it('should return attributes with parsed custom fields', () => {
			const ddd = { title: 'Post', date: 'Nov 8, 2013' };
			const result = core.parseCustomFields(ddd, {
				date: Date.parse,
			});
			expect(result.title).toEqual('Post');
			expect(new Date(result.date).toDateString()).toEqual('Fri Nov 08 2013');
		});
		it('should be able to create new attributes', () => {
			const ddd = { title: 'Post', date: 'Nov 8, 2013' };
			const result = core.parseCustomFields(ddd, {
				timestamp: (t, attrs) => Date.parse(attrs.date),
				date: d => new Date(Date.parse(d)),
			});
			expect(result.title).toEqual('Post');
			expect(new Date(result.timestamp).toDateString()).toEqual('Fri Nov 08 2013');
			expect(result.date.toDateString()).toEqual('Fri Nov 08 2013');
		});
	});

	describe('parsePage', () => {
		const renderers = { md: renderMarkdown };
		it('should parse Markdown source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.md';
			const result = core.parsePage(readFile(path.join(folder, filepath)), filepath, { renderers });
			expect(result).toEqual(require('./expected/markdown-with-frontmatter.md.js'));
		});
		it('should modify all fields using custom field parsers', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.md';
			const result = core.parsePage(readFile(path.join(folder, filepath)), filepath, {
				renderers,
				fieldParsers: {
					lang: () => 'ru',
					url: u => `/ru${u}`,
				},
			});
			expect(result).toEqual(require('./expected/markdown-with-custom-fields.js'));
		});
		it('should split content to excerpt and more if cut tag is used', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-cut.md';
			const result = core.parsePage(readFile(path.join(folder, filepath)), filepath, {
				cutTag: '<!-- cut -->',
				renderers,
			});
			expect(result).toEqual(require('./expected/markdown-with-cut.md.js'));
		});
		it('should parse HTML source with frontmatter to an object', () => {
			const folder = 'test/samples';
			const filepath = 'markdown-with-frontmatter.html';
			const result = core.parsePage(readFile(path.join(folder, filepath)), filepath, { renderers });
			expect(result).toEqual(require('./expected/markdown-with-frontmatter.html.js'));
		});
	});

	describe('getSourceFilesList', () => {
		it('should return a list of source files', () => {
			const result = core.getSourceFilesList('test/source', ['md', 'html']);
			expect(result).toEqual([
				'en/plugins-requirejs.md',
				'en/read-less-tech-books.md',
				'ru/debug-mode.md',
			]);
		});
	});

	describe('loadSourceFiles', () => {
		it('should return an object with parsed source files', () => {
			const result = core.loadSourceFiles('test/source', ['md', 'html'], {
				renderers: { md: renderMarkdown },
			});
			expect(result).toEqual(require('./expected/files.js'));
		});
		it('should work with a single file type', () => {
			const result = core.loadSourceFiles('test/source', ['md'], {
				renderers: { md: renderMarkdown },
			});
			expect(result).toEqual(require('./expected/files.js'));
		});
	});

	describe('getConfigFilesList', () => {
		it('should return a list of config files', () => {
			const result = core.getConfigFilesList('test/config');
			expect(result).toEqual(['test/config/base.yml', 'test/config/en.yml', 'test/config/ru.yml']);
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files to an object', () => {
			const result = core.readConfigFiles(['test/config/base.yml']);
			expect(result).toEqual(require('./expected/configs.json'));
		});
	});

	describe('readConfigFiles', () => {
		it('should read config files (with langs) to an object', () => {
			const result = core.readConfigFiles([
				'test/config/base.yml',
				'test/config/en.yml',
				'test/config/ru.yml',
			]);
			expect(result).toEqual(require('./expected/configs-langs.json'));
		});
	});

	describe('mergeConfigs', () => {
		it('should merge config objects', () => {
			const result = core.mergeConfigs(require('./expected/configs.json'));
			expect(result).toEqual(require('./expected/configs-merged.json'));
		});
		it('should merge config objects (with langs)', () => {
			const result = core.mergeConfigs(require('./expected/configs-langs.json'));
			expect(result).toEqual(require('./expected/configs-langs-merged.json'));
		});
	});

	describe('loadConfig', () => {
		it('should return merged config object', () => {
			const result = core.loadConfig('test/config');
			expect(result).toEqual(require('./expected/configs-langs-merged.json'));
		});
	});

	describe('makeContext', () => {
		it('should return merged config object', () => {
			const result = core.makeContext(
				{
					title: 'Hello',
					content: '<b>Test</b>',
				},
				{
					base: {
						title: 'Blog',
						author: 'Artem Sapegin',
					},
				},
				{
					siteTitle: function() {
						return this.config.base.title;
					},
					heading: function(level) {
						return `<h${level}>${this.title}</h${level}>`;
					},
				}
			);
			expect(result.title).toEqual('Hello');
			expect(result.config.base.title).toEqual('Blog');
			expect(result.siteTitle()).toEqual('Blog');
			expect(result.heading(2)).toEqual('<h2>Hello</h2>');
		});
	});

	describe('filterDocuments', () => {
		it('should filter documents by field value', () => {
			const result = core.filterDocuments(
				[
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
						lang: 'en',
					},
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
						lang: 'ru',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
						lang: 'ru',
					},
				],
				{ lang: 'ru' }
			);
			expect(result.length).toEqual(2);
			expect(result[0].title).toEqual('Post 2');
		});
		it('should filter documents by RegExp', () => {
			const result = core.filterDocuments(
				[
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
					},
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
					},
				],
				{ sourcePath: /^all\// }
			);
			expect(result.length).toEqual(2);
			expect(result[0].title).toEqual('Post 1');
		});
		it('should filter documents by function result', () => {
			const result = core.filterDocuments(
				[
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
					},
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
					},
				],
				{ sourcePath: val => val.startsWith('all/') }
			);
			expect(result.length).toEqual(2);
			expect(result[0].title).toEqual('Post 1');
		});
		it('should filter documents by multiple fields', () => {
			const result = core.filterDocuments(
				[
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
					},
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
					},
				],
				{ title: 'Post 1', sourcePath: /^all\// }
			);
			expect(result.length).toEqual(1);
			expect(result[0].title).toEqual('Post 1');
		});
	});

	describe('orderDocuments', () => {
		it('should sort array of documents', () => {
			const result = core.orderDocuments(
				[
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
					},
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
					},
				],
				['title']
			);
			expect(_.map(result, 'title')).toEqual(['About', 'Post 1', 'Post 2']);
		});
		it('should sort array of documents backwards', () => {
			const result = core.orderDocuments(
				[
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
					},
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
					},
				],
				['-title']
			);
			expect(_.map(result, 'title')).toEqual(['Post 2', 'Post 1', 'About']);
		});
		it('should sort array by miltiple fields', () => {
			const result = core.orderDocuments(
				[
					{
						title: 'Post 1',
						sourcePath: 'all/post1.md',
						layout: 'post',
					},
					{
						title: 'About',
						sourcePath: 'about.md',
						layout: 'about',
					},
					{
						title: 'Post 2',
						sourcePath: 'all/post2.md',
						layout: 'post',
					},
				],
				['-layout', 'title']
			);
			expect(_.map(result, 'title')).toEqual(['Post 1', 'Post 2', 'About']);
		});
	});

	describe('groupDocuments', () => {
		it('should group documents by a single value', () => {
			const result = core.groupDocuments(
				[
					{
						title: 'Post 1',
						layout: 'post',
					},
					{
						title: 'Post 2',
						layout: 'post',
					},
					{
						title: 'About',
						layout: 'about',
					},
				],
				'layout'
			);
			expect(result).toEqual({
				post: [{ title: 'Post 1', layout: 'post' }, { title: 'Post 2', layout: 'post' }],
				about: [{ title: 'About', layout: 'about' }],
			});
		});
		it('should group documents by every item if the value is an array', () => {
			const result = core.groupDocuments(
				[
					{
						title: 'Post 1',
						tags: 'foo',
					},
					{
						title: 'Post 2',
						tags: ['bar', 'foo'],
					},
					{
						title: 'Post 3',
						tags: ['foo'],
					},
				],
				'tags'
			);
			expect(result).toEqual({
				foo: [
					{ title: 'Post 1', tags: 'foo' },
					{ title: 'Post 2', tags: ['bar', 'foo'] },
					{ title: 'Post 3', tags: ['foo'] },
				],
				bar: [{ title: 'Post 2', tags: ['bar', 'foo'] }],
			});
		});
		it('should skip document if the field value is undefined', () => {
			const result = core.groupDocuments(
				[
					{
						title: 'Post 1',
						layout: 'post',
					},
					{
						title: 'Post 2',
					},
					{
						title: 'About',
						layout: 'about',
					},
				],
				'layout'
			);
			expect(result).toEqual({
				post: [{ title: 'Post 1', layout: 'post' }],
				about: [{ title: 'About', layout: 'about' }],
			});
		});
		it('should group documents by the result of function call', () => {
			const result = core.groupDocuments(
				[
					{
						title: 'Post 1',
						date: '2014-06-17',
					},
					{
						title: 'Post 2',
						date: '2015-09-01',
					},
					{
						title: 'About',
						date: '2014-01-12',
					},
				],
				d => Number(d.date.split('-')[0])
			);
			expect(result).toEqual({
				2014: [{ title: 'Post 1', date: '2014-06-17' }, { title: 'About', date: '2014-01-12' }],
				2015: [{ title: 'Post 2', date: '2015-09-01' }],
			});
		});
	});

	describe('generatePage', () => {
		const render = (layout, context) => renderTemplate(`${layout}.jsx`, context);

		it('should render page using template from frontmatter', () => {
			const result = core.generatePage(
				{
					title: 'Hello',
					layout: 'layout',
					sourcePath: 'all/post.md',
					content: '<b>Test</b>',
				},
				{
					base: {},
				},
				{},
				render
			);
			expect(result.content).toEqual('<!doctype html><div><h1>Hello</h1><b>Test</b></div>');
			expect(result.pagePath).toEqual('all/post.html');
		});
		it('should use layout extension if it is specified (feed.xml.jsx → feed.xml)', () => {
			const result = core.generatePage(
				{
					title: 'Hello',
					layout: 'layout.xml',
					sourcePath: 'all/feed.md',
					content: '<b>Test</b>',
				},
				{
					base: {},
				},
				{},
				render
			);
			expect(result.content).toEqual('<!doctype html><foo><b>Test</b></foo>');
			expect(result.pagePath).toEqual('all/feed.xml');
		});
		it('should render an RSS feed if layout is "RSS"', () => {
			const result = core.generatePage(
				{
					title: 'Hello',
					description: 'My RSS',
					layout: 'RSS',
					url: '/feed',
					sourcePath: 'feed.md',
					items: [
						{
							title: 'Post 1',
							content: 'Hello world 1.',
							url: '/blog/1',
							date: 'Jan 1, 2016',
						},
						{
							title: 'Post 2',
							content: '<p>Read more in <a href="/blog/22">this post</a>.</p>',
							url: '/blog/2',
							date: 'Jan 2, 2016',
						},
					],
				},
				{
					base: {
						url: 'http://example.com/',
					},
				},
				helpers,
				{
					jsx: renderTemplate,
				}
			);

			const content = result.content.replace(
				/<(\w+Date)>\w+, \d+ \w+ 20\d\d \d\d:\d\d:\d\d GMT<\/(?:\w+Date)>/g,
				'<$1>Sun, 1 Apr 2016 11:12:13 GMT</$1>'
			);
			expect(content).toEqual(readFile('test/expected/feed.xml'));
			expect(result.pagePath).toEqual('feed.xml');
		});
		it('should throw if layout is not specified', () => {
			const func = () => {
				core.generatePage(
					{
						title: 'Hello',
						sourcePath: 'all/post.md',
						content: '<b>Test</b>',
					},
					{
						base: {},
					},
					{},
					{ jsx: renderTemplate }
				);
			};
			expect(func).toThrow();
		});
	});

	describe('generatePages', () => {
		it('should render array of pages', () => {
			const result = core.generatePages(
				[
					{
						title: 'Hello',
						layout: 'layout',
						sourcePath: 'all/post.md',
						content: '<b>Test</b>',
					},
					{
						title: 'Bye',
						layout: 'layout',
						sourcePath: 'all/post2.md',
						content: '<b>Foobarbaz</b>',
					},
				],
				{
					base: {},
				},
				{},
				{ jsx: renderTemplate }
			);
			expect(result.length).toEqual(2);
			expect(result[0].content).toEqual('<!doctype html><div><h1>Hello</h1><b>Test</b></div>');
			expect(result[0].pagePath).toEqual('all/post.html');
			expect(result[1].content).toEqual('<!doctype html><div><h1>Bye</h1><b>Foobarbaz</b></div>');
			expect(result[1].pagePath).toEqual('all/post2.html');
		});
	});

	describe('getPageNumberUrl', () => {
		it('should return pagination page number', () => {
			const result = core.getPageNumberUrl('all', 5);
			expect(result).toEqual('all/page/5');
		});
		it('should return URL prefix for the first page', () => {
			const result = core.getPageNumberUrl('all', 1);
			expect(result).toEqual('all');
		});
		it('should add index if index options is true', () => {
			const result = core.getPageNumberUrl('all', 1, { index: true });
			expect(result).toEqual('all/index');
		});
		it('should not return double slash: page number', () => {
			const result = core.getPageNumberUrl('/', 5);
			expect(result).toEqual('/page/5');
		});
		it('should not return double slash: first page', () => {
			const result = core.getPageNumberUrl('/', 1);
			expect(result).toEqual('/');
		});
		it('should not return double slash: index', () => {
			const result = core.getPageNumberUrl('/', 1, { index: true });
			expect(result).toEqual('/index');
		});
	});

	describe('paginate', () => {
		it('should return an array of documents with pagination info', () => {
			const result = core.paginate(
				[
					{ title: 'Post 1', layout: 'post', sourcePath: 'all/post1.md', content: '<b>1</b>' },
					{ title: 'Post 2', layout: 'post', sourcePath: 'all/post2.md', content: '<b>2</b>' },
					{ title: 'Post 3', layout: 'post', sourcePath: 'all/post3.md', content: '<b>3</b>' },
					{ title: 'Post 4', layout: 'post', sourcePath: 'all/post4.md', content: '<b>4</b>' },
					{ title: 'Post 5', layout: 'post', sourcePath: 'all/post5.md', content: '<b>5</b>' },
					{ title: 'Post 6', layout: 'post', sourcePath: 'all/post6.md', content: '<b>6</b>' },
					{ title: 'Post 7', layout: 'post', sourcePath: 'all/post7.md', content: '<b>7</b>' },
					{ title: 'Post 8', layout: 'post', sourcePath: 'all/post8.md', content: '<b>8</b>' },
					{ title: 'Post 9', layout: 'post', sourcePath: 'all/post9.md', content: '<b>9</b>' },
					{ title: 'Post 10', layout: 'post', sourcePath: 'all/post10.md', content: '<b>10</b>' },
				],
				{
					sourcePathPrefix: 'all',
					urlPrefix: '/all',
					documentsPerPage: 3,
					layout: 'pagination',
				}
			);
			expect(result).toEqual(require('./expected/pagination.json'));
		});
		it('should add extra options to every generated document', () => {
			const result = core.paginate(
				[
					{ title: 'Post 1', layout: 'post', sourcePath: 'all/post1.md', content: '<b>1</b>' },
					{ title: 'Post 2', layout: 'post', sourcePath: 'all/post2.md', content: '<b>2</b>' },
				],
				{
					sourcePathPrefix: 'all',
					urlPrefix: '/all',
					documentsPerPage: 1,
					layout: 'pagination',
					extra: {
						foo: 42,
						bar: 13,
					},
				}
			);
			expect(result[0].foo).toEqual(42);
			expect(result[1].bar).toEqual(13);
		});
	});

	describe('savePage', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should save page to HTML file', () => {
			core.savePage(
				{
					pagePath: 'all/post.html',
					content: '<h1>Hello</h1>\n<b>Test</b>',
				},
				'test/tmp'
			);
			expect(readFile('test/tmp/all/post.html')).toEqual('<h1>Hello</h1>\n<b>Test</b>');
		});
	});

	describe('savePages', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should save array of page to HTML files', () => {
			core.savePages(
				[
					{
						pagePath: 'all/post.html',
						content: '<h1>Hello</h1>\n<b>Test</b>',
					},
					{
						pagePath: 'all/post2.html',
						content: '<h1>Bye</h1>\n<b>Foobarbaz</b>',
					},
				],
				'test/tmp'
			);
			expect(readFile('test/tmp/all/post.html')).toEqual('<h1>Hello</h1>\n<b>Test</b>');
			expect(readFile('test/tmp/all/post2.html')).toEqual('<h1>Bye</h1>\n<b>Foobarbaz</b>');
		});
	});
});
