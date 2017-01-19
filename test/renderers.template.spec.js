import { expect } from 'chai';

import createTemplateRenderer from '../src/renderers/template';
import { readFile } from '../src/util';

describe('template', () => {
	describe('render', () => {
		it('should return function', () => {
			const render = createTemplateRenderer();
			expect(render).to.be.a.func;
		});
		it('should render template to HTML', () => {
			const render = createTemplateRenderer({ root: 'test/samples' });
			const result = render('template', { world: 'world' });
			expect(result).to.eql(readFile('test/expected/template.html'));
		});
	});
});
