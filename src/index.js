// Public API
export {
	loadConfig,
	loadSourceFiles,
	generatePages,
	savePages,
	filterDocuments,
	orderDocuments,
	gropDocuments,
	paginate
} from './core';

// Default renderers
export { default as createMarkdownRenderer } from './renderers/markdown';
export { default as createTemplateRenderer } from './renderers/template';

// Default helpers
import * as helpers from '../lib/helpers';
export { helpers };
