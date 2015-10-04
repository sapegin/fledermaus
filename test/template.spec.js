import { expect } from 'chai';

import createTemplateRenderer from '../lib/template';
import { readFile } from '../lib/util';

describe('template', () => {

	describe('render', () => {
		it('should return function', () => {
			let render = createTemplateRenderer();
			expect(render).to.be.a.func;
		});
		it('should render template to HTML', () => {
			let render = createTemplateRenderer({root: 'test/samples'});
			let result = render('template', {world: 'world'});
			expect(result).to.eql(readFile('test/expected/template.html'));
		});
	});

});
