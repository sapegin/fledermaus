import { expect } from 'chai';

import * as util from '../lib/util';

describe('util', () => {

	describe('readFile', () => {
		it('should return a file content', () => {
			let result = util.readFile('test/samples/file.txt');
			expect(result).to.eql('Hello.');
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
