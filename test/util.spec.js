import fs from 'fs';
import { expect } from 'chai';
import rimraf from 'rimraf';

import * as util from '../src/util';

describe('util', () => {

	describe('removeExtension', () => {
		it('should remove extension from file path', () => {
			let result = util.removeExtension('ru/markdown.md');
			expect(result).to.eql('ru/markdown');
		});
	});

	describe('getExtension', () => {
		it('should remove extension from file path', () => {
			let result = util.getExtension('ru/markdown.md');
			expect(result).to.eql('md');
		});
	});

	describe('readFile', () => {
		it('should return a file content', () => {
			let result = util.readFile('test/samples/file.txt');
			expect(result).to.eql('Hello.');
		});
	});

	describe('writeFile', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should saves a string to a file on a disk', () => {
			const filepath = 'test/tmp/file.txt';
			util.writeFile(filepath, 'Hello.');
			expect(fs.existsSync(filepath)).to.be.true;
			expect(fs.readFileSync(filepath, {encoding: 'utf8'})).to.eql('Hello.');
		});
	});

	describe('readYamlFile', () => {
		it('should read and parse YAML file', () => {
			let result = util.readYamlFile('test/samples/file.yml');
			expect(result).to.eql({hello: 'world'});
		});
	});

	describe('tmpl', () => {
		it('should render a simple template', () => {
			let result = util.tmpl('Hello {wrld}!', {wrld: 'world'});
			expect(result).to.eql('Hello world!');
		});
		it('should leave unknown tags as is', () => {
			let result = util.tmpl('Hello {wrld}, {nooo}!', {wrld: 'world'});
			expect(result).to.eql('Hello world, {nooo}!');
		});
	});

	describe('meta', () => {
		it('should return HTML meta tag', () => {
			let result = util.meta('description', 'My blog');
			expect(result).to.eql('<meta name="description" content="My blog">');
		});
	});

	describe('og', () => {
		it('should return HTML meta tag for Open Graph', () => {
			let result = util.og('description', 'My blog');
			expect(result).to.eql('<meta property="description" content="My blog">');
		});
	});

});
