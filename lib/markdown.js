import marked from 'marked';
import hljs from 'highlight.js';
import _ from 'lodash';

class Renderer extends marked.Renderer {
	// Do not put IDs in headers
	heading(text, level, raw) {
		let tag = `h${level}`;
		return `<${tag}>${text}</${tag}>\n`;
	}
}

const defaultOptions = {
	renderer: Renderer,
	hljs: {
		tabReplace: null,
		aliases: {
			yaml: 'python',
			shell: 'bash'
		}
	}
};

/**
 * Returns function that renders Markdown using Marked.
 * 
 * @param {Object} options
 * @return {Function}
 */
export default function createMarkdownRenderer(options = {}) {
	options = _.merge({}, defaultOptions, options);

	// HACK: global Highlight.js options
	hljs.configure(options.hljs);

	let markedOptions = {
		renderer: new options.renderer(),
		highlight: function(code, lang) {
			if (lang) {
				return hljs.highlight(options.hljs.aliases[lang] || lang, code).value;
			}
			else {
				return hljs.highlightAuto(code).value;
			}
		}
	};

	return function render(source) {
		return marked(source, markedOptions);
	};
}
