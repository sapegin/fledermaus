import remark from 'remark';
import remarkHtml from 'remark-html';
import visit from 'unist-util-visit';
import hljs from 'highlight.js';
import parse5 from 'parse5';
import _ from 'lodash';
import { errorInlineHtml } from '../util';

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

const remarkHtmlOptions = {
	entities: 'escape',
};

/**
 * Escape double slashes inside custom tags.
 *
 * @param {string} string
 * @return {string}
 */
export function escapeMarkdownInTags(string) {
	return string.replace(/<x-[-\w]+>[\s\S]*?<\/x-/gm, m => {
		return m.replace(/\/\//g, '\\/\\/');
	});
}

/**
 * Unescape double slashes in Markdown.
 *
 * @param {string} string
 * @return {string}
 */
export function unescapeMarkdown(string) {
	return string.replace(/\\\/\\\//g, '//');
}

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
			if (!tagNode) {
				throw new Error('Cannot parse custom tag:', child.value);
			}
			let { tagName, attrs } = tagNode;
			let childNode = tagNode.childNodes[0];
			attrs.push({
				name: 'children',
				value: childNode ? unescapeMarkdown(childNode.value).trim() : null,
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
				result = errorInlineHtml(`Error while rendering custom tag <x-${tagName}>: ${e.message}`, { block: true });
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
 * Render Markdow using given processor.
 *
 * @param {Object} processor Remark processor.
 * @param {string} source Source Markdown.
 * @return {string}
 */
function render(processor, source) {
	try {
		return processor.process(source);
	}
	catch (e) {
		let error = `Error while rendering Markdown: ${e.message}`;
		console.error(error);
		return errorInlineHtml(error);
	}
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
		[remarkHtml, remarkHtmlOptions]
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

	return source => {
		source = escapeMarkdownInTags(source);
		return render(processor, source);
	};
}

/**
 * Returns function that renders Markdown using Remark (without any extra plugins).
 *
 * @return {Function}
 */
export function createSimpleMarkdownRenderer() {
	const processor = remark().use(remarkHtml, remarkHtmlOptions);
	return source => render(processor, source);
}
