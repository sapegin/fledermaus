import { expect } from 'chai';

import renderTemplate, { init as initTemplates } from '../lib/template';
import { readFile } from '../lib/util';

describe('template', () => {

	describe('render', () => {
		it('should render template to HTML', () => {
			initTemplates('test/samples');
			let result = renderTemplate('test/samples/template.ect', {world: 'world'});
			expect(result).to.eql(readFile('test/expected/template.html'));
		});
	});

});
