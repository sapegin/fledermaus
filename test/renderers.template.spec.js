import createTemplateRenderer from '../src/renderers/template';
import { readFile } from '../src/util';

describe('template', () => {
	describe('render', () => {
		it('should return function', () => {
			const render = createTemplateRenderer();
			expect(render).toEqual(expect.any(Function));
		});
		it('should render template to HTML', () => {
			const render = createTemplateRenderer({ root: 'test/samples' });
			const result = render('template', { world: 'world' });
			expect(result).toEqual(readFile('test/expected/template.html'));
		});
	});
});
