// TODO
var expect = require('chai').expect;

import fs from 'fs';

import * as core from '../lib/core';

// TODO
function readFile(filepath) {
	return fs.readFileSync(filepath, {encoding: 'utf8'});
}

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



});
