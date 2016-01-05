import marked from 'marked';
import hljs from 'highlight.js';
import parse5 from 'parse5';
import _ from 'lodash';

export class MarkdownRenderer extends marked.Renderer {
	// Do not put IDs in headers
	heading(text, level) {
		let tag = `h${level}`;
		return `<${tag}>${text}</${tag}>\n`;
	}

	// Custom tags
	html(html) {
		if (html.startsWith('<x-')) {
			// Parse tag’s HTML
			let dom = parse5.parseFragment(html);
			let node = dom.childNodes[0];
			let { tagName, attrs } = node;
			tagName = tagName.replace(/^x-/, '');

			// Check tag function
			let tagFunction = this.options.customTags[tagName];
			if (!tagFunction || !_.isFunction(tagFunction)) {
				throw new Error(`Custom tag "${tagName}" is not defined or is not a function.`);
			}

			// Unzip attributes
			attrs = attrs.reduce((attrsObj, attr) => {
				attrsObj[attr.name] = attr.value;
				return attrsObj;
			}, {});

			// Render
			return tagFunction(attrs);
		}
		return html;
	}
}

const defaultOptions = {
	renderer: MarkdownRenderer,
	hljs: {
		tabReplace: null,
		aliases: {
			yaml: 'python',
			shell: 'bash'
		}
	},
	customTags: {}
};

/**
 * Returns function that renders Markdown using Marked.
 *
 * @param {object} options
 * @return {Function}
 */
export default function createMarkdownRenderer(options = {}) {
	options = _.merge({}, defaultOptions, options);

	// HACK: global Highlight.js options
	hljs.configure(options.hljs);

	let markedOptions = {
		renderer: new options.renderer(),
		customTags: options.customTags,
		highlight(code, lang) {
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
