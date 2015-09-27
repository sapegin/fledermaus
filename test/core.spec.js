import { expect } from 'chai';

import * as core from '../lib/core';
import { readFile } from '../lib/core';

describe('core', () => {

	describe('removeExtension', () => {
		it('should remove extension from file path', () => {
			let result = core.removeExtension('ru/markdown.md');
			expect(result).to.eql('ru/markdown');
		});
	});

	describe('filepathToUrl', () => {
		it('should transform file path to relative URL', () => {
			let result = core.filepathToUrl('ru/markdown.md');
			expect(result).to.eql('/ru/markdown');
		});
	});

	describe('parsePage', () => {
		it('should parse Markdown source with frontmatter to an object', () => {
			let filepath = 'test/samples/markdown-with-frontmatter.md';
			let result = core.parsePage(readFile(filepath), filepath);
			expect(result).to.eql(require('./expected/markdown-with-frontmatter.md.json'));
		});
		it('should parse HTML source with frontmatter to an object', () => {
			let filepath = 'test/samples/markdown-with-frontmatter.html';
			let result = core.parsePage(readFile(filepath), filepath);
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

	describe('readFile', () => {
		it('should return a file content', () => {
			let result = core.readFile('test/samples/file.txt');
			expect(result).to.eql('Hello.');
		});
	});

	describe('readYamlFile', () => {
		it('should read and parse YAML file', () => {
			let result = core.readYamlFile('test/samples/file.yml');
			expect(result).to.eql({hello: 'world'});
		});
	});

	describe('readFiles', () => {
		it('should return an array with the content of every file from a given array', () => {
			let result = core.readFiles([
				'test/source/en/read-less-tech-books.md',
				'test/source/ru/debug-mode.md'
			]);
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

	describe('readConfig', () => {
		it('should return merged config object', () => {
			let result = core.readConfig('test/config');
			// console.log(JSON.stringify(result));
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


});
