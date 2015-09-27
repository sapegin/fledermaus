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

});
