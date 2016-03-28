import remark from 'remark';
import remarkHtml from 'remark-html';
import visit from 'unist-util-visit';
import hljs from 'highlight.js';
import parse5 from 'parse5';
import _ from 'lodash';

/* eslint-disable no-console */

const defaultOptions = {
	plugins: [],
	hljs: {
		aliases: {
			yaml: 'python',
			shell: 'bash',
		},
	},
	customTags: {},
};

/**
 * Remark plugin for custom tags: <x-foo data-value="42"/>
 *
 * @param {Object} processor
 * @param {Object} customTags
 * @return {Function}
 */
function remarkCustomTags(processor, customTags) {
	return ast => visit(ast, 'paragraph', node => {
		let child = node.children && node.children[0];
		if (child && child.type === 'text' && child.value.startsWith('<x-')) {
			// Parse tag’s HTML
			let dom = parse5.parseFragment(child.value);
			let tagNode = dom.childNodes[0];
			let { tagName, attrs } = tagNode;
			let childNode = tagNode.childNodes[0];
			attrs.push({
				name: 'children',
				value: childNode ? childNode.value.trim() : null,
			});
			tagName = tagName.replace(/^x-/, '');

			// Check tag function
			let tagFunction = customTags[tagName];
			if (!tagFunction || !_.isFunction(tagFunction)) {
				throw new Error(`Custom tag "${tagName}" is not defined or is not a function.`);
			}

			// Unzip attributes
			attrs = attrs.reduce((attrsObj, attr) => {
				attrsObj[attr.name] = attr.value;
				return attrsObj;
			}, {});

			// Render
			let result;
			try {
				result = tagFunction(attrs) || '';
			}
			catch (e) {
				let error = `Error while rendering custom tag <x-${tagName}>: ${e.message}`;
				result = `<p><b>${_.escape(error)}</b></p>`;
				console.error(error);
			}
			node.type = 'html';
			node.value = result.trim();
			node.children = null;
		}
	});
}

/**
 * Remark plugin for Highlight.js.
 *
 * @param {Object} processor
 * @param {Object} options
 * @return {Function}
 */
function remarkHljs(processor, options) {
	return ast => visit(ast, 'code', node => {
		if (!node.data) {
			node.data = {};
		}

		let lang = node.lang;
		node.data.htmlContent = lang
			? hljs.highlight(options.aliases[lang] || lang, node.value).value
			: hljs.highlightAuto(node.value).value
		;
	});
}

/**
 * Returns function that renders Markdown using Remark.
 *
 * @param {object} options
 * @return {Function}
 */
export default function createMarkdownRenderer(options = {}) {
	options = _.merge({}, defaultOptions, options);

	// Create Remark processor
	const processor = remark();

	// Attach plugins
	let plugins = options.plugins;
	plugins.push(
		[remarkCustomTags, options.customTags],
		[remarkHtml, {
			entities: 'escape',
		}]
	);
	if (options.hljs) {
		plugins.push(
			[remarkHljs, options.hljs]
		);
	}
	plugins.forEach(plugin => {
		if (Array.isArray(plugin)) {
			processor.use(plugin[0], plugin[1]);
		}
		else {
			processor.use(plugin);
		}
	});

	return function render(source) {
		return processor.process(source);
	};
}

/**
 * Returns function that renders Markdown using Remark (without any extra plugins).
 *
 * @param {object} options
 * @return {Function}
 */
export function createSimpleMarkdownRenderer() {
	const processor = remark();
	processor.use(remarkHtml, {
		entities: 'escape',
	});

	return function render(source) {
		return processor.process(source);
	};
}
