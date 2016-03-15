// Public API
export {
	loadConfig,
	loadSourceFiles,
	generatePages,
	savePages,
	filterDocuments,
	orderDocuments,
	groupDocuments,
	paginate,
} from './core';

// Utilities
export { start } from './util';

// Default renderers
export { default as createMarkdownRenderer } from './renderers/markdown';
export { default as createTemplateRenderer } from './renderers/template';

// Default helpers
import * as helpers from '../lib/helpers';
export { helpers };
