import { expect } from 'chai';

import * as util from '../lib/util';

describe('util', () => {

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
