import path from 'path';
import glob from 'glob';
import fastmatter from 'fastmatter';
import _ from 'lodash';

import {
	getExtension,
	removeExtension,
	readFile,
	writeFile,
	readYamlFile,
	formatFieldsForSortByOrder
} from './util';

/**
 * Convert file path to URL.
 *
 * @param {String} filepath
 * @return {String}
 */
export function filepathToUrl(filepath) {
	let url = '/' + removeExtension(filepath);
	url = url.replace(/\/index$/, '');
	if (url === '') {
		return '/';
	}
	return url;
}

/**
 * Renders source using appropriate renderer based on file extension.
 *
 * @param {String} source Source file contents.
 * @param {String} filepath Source file path.
 * @param {Object} renderers {ext: renderFunction}
 * @return {String}
 */
export function renderByType(source, filepath, renderers = {}) {
	let extension = getExtension(filepath);
	let render = renderers[extension];
	if (_.isFunction(render)) {
		return render(source);
	}
	return source;
}

/**
 * Return attributes object with parsed custom fields.
 *
 * @param {Object} attributes
 * @param {Object} fieldParsers  Custom field parsers: {name: parseFunction}
 * @return {Object}
 */
export function parseCustomFields(attributes, fieldParsers) {
	let parsedAttributes = {};
	for (let name in fieldParsers) {
		parsedAttributes[name] = fieldParsers[name](attributes[name], attributes);
	}
	return {...attributes, ...parsedAttributes};
}

/**
 * Parse front matter and render contents.
 *
 * @param {String} source Source file contents.
 * @param {String} folder Source folder.
 * @param {String} filepath Source file path relative to `folder`.
 * @param {Object} options.renderers Content renderers: {ext: renderFunction}.
 * @param {Object} options.fieldParsers Custom field parsers: {name: parseFunction}.
 * @param {Object} options.cutTag Cut separator.
 * @return {Object} { sourcePath, content, excerpt, more, url }
 */
export function parsePage(source, folder, filepath, { renderers = {}, fieldParsers = {}, cutTag } = {}) {
	let { attributes, body } = fastmatter(source);

	let url = filepathToUrl(filepath);

	let content = renderByType(body, filepath, renderers);

	let excerpt, more;
	if (cutTag) {
		[excerpt, more] = content.split(cutTag);
	}

	attributes = {
		...attributes,
		sourcePath: filepath,
		content,
		excerpt,
		more,
		url
	};

	attributes = parseCustomFields(attributes, fieldParsers);

	return attributes;
}

/**
 * Return list of source files.
 *
 * @param {String} folder Source folder.
 * @param {Array} types List of file extensions.
 * @return {Array}
 */
export function getSourceFilesList(folder, types) {
	let typesMask = types.join(',');
	let mask = `**/*.{${typesMask}}`;
	return glob.sync(mask, {cwd: folder});
}

/**
 * Load source files from a disk.
 *
 * @param {String} folder Source folder.
 * @param {Array} types List of file extensions.
 * @param {Object} options { renderers, fieldParsers, cutTag }
 * @return {Array} [{ sourcePath, content, url }, ...]
 */
export function loadSourceFiles(folder, types, options) {
	let files = getSourceFilesList(folder, types);
	return files.map((filepath) => {
		let source = readFile(path.join(folder, filepath));
		return parsePage(source, folder, filepath, options);
	});
}

/**
 * Return list of config files.
 *
 * @param {String} folder Configs folder.
 * @return {Array}
 */
export function getConfigFilesList(folder) {
	return glob.sync(path.join(folder, '*.yml'));
}

/**
 * Read config files from a disk.
 *
 * @param {Array} files Config files list.
 * @return {Object} {base: {...}, langs: {...}}
 */
export function readConfigFiles(files) {
	return files.reduce((configs, filepath) => {
		let name = removeExtension(path.basename(filepath));
		if (name === 'base') {
			configs.base = readYamlFile(filepath);
		}
		else {
			configs.langs[name] = readYamlFile(filepath);
		}
		return configs;
	}, {base: {}, langs: {}});
}

/**
 * Merge base config with language specific configs.
 *
 * @param {Object} configs
 * @return {Object} {base: {...}} or {langs: {...}}
 */
export function mergeConfigs(configs) {
	let { base, langs } = configs;
	let baseConfig = {
		base
	};

	if (_.isEmpty(langs)) {
		return baseConfig;
	}

	return Object.keys(langs).reduce((merged, lang) => {
		merged[lang] = {...configs.base, ...langs[lang]};
		return merged;
	}, baseConfig);
}

/**
 * Load config files from a disk.
 *
 * @param {String} folder Source folder.
 * @return {Object} {base: {...}} or {langs: {...}}
 */
export function loadConfig(folder) {
	let files = getConfigFilesList(folder);
	let configs = readConfigFiles(files);
	return mergeConfigs(configs);
}

/**
 * Filter documents.
 *
 * @param {Array} documents Documents.
 * @param {Object} fields Filters by field: {lang: 'en', url: /^posts\//}
 * @return {Array}
 */
export function filterDocuments(documents, fields) {
	return documents.filter((document) => {
		for (let field in fields) {
			let value = fields[field];
			let documentValue = document[field];
			if (_.isRegExp(value)) {
				if (!value.test(documentValue)) {
					return false;
				}
			}
			else if (documentValue !== value) {
				return false;
			}
		}
		return true;
	});
}

/**
 * Order documents.
 *
 * @param {Array} documents Documents.
 * @param {Array} fields ['foo', '-bar']
 * @return {Array}
 */
export function orderDocuments(documents, fields) {
	fields = formatFieldsForSortByOrder(fields);
	return _.sortByOrder(documents, ...fields);
}

/**
 * Group documents by values of a given field.
 *
 * @param {Array} documents Documents.
 * @param {String|Function} field Field name or function.
 * @return {Object} {fieldValue1: [...], fieldValue2: [...], ...}
 */
export function groupDocuments(documents, field) {
	return documents.reduce((grouped, document) => {
		let value = document[field];
		if (Array.isArray(value)) {
			value.forEach((subValue) => {
				if (!grouped[subValue]) {
					grouped[subValue] = [];
				}
				grouped[subValue].push(document);
			});
		}
		else {
			if (_.isFunction(field)) {
				value = field(document);
			}
			if (!value) {
				return grouped;
			}
			if (!grouped[value]) {
				grouped[value] = [];
			}
			grouped[value].push(document);
		}
		return grouped;
	}, {});
}

/**
 * Return URL for given page number.
 *
 * @param {String} urlPrefix
 * @param {Number} pageNumber
 * @param {Boolean} options.index First page will be `index` if true.
 * @return {String}
 */
export function getPageNumberUrl(urlPrefix, pageNumber, { index } = {}) {
	if (pageNumber === 1) {
		if (index) {
			return `${urlPrefix}/index`;
		}
		else {
			return urlPrefix;
		}
	}
	else {
		return `${urlPrefix}/page/${pageNumber}`;
	}
}

/**
 * Generate documents to paginate given documents.
 *
 * @param {Array} documents Documents to paginate
 * @param {String} options.sourcePathPrefix Source path prefix.
 * @param {String} options.urlPrefix URL prefix.
 * @param {Number} options.documentsPerPage Documents per page.
 * @param {String} options.layout Page layout.
 * @param {Boolean} options.index Add `index` to the first page’s source path.
 * @param {Object} options.extra Extra document options.
 * @return {Array}
 */
export function paginate(documents, { sourcePathPrefix, urlPrefix, documentsPerPage, layout, index, extra = {} } = {}) {
	if (!sourcePathPrefix) {
		throw new Error('"sourcePathPrefix" not specified for paginate().');
	}
	if (!urlPrefix) {
		throw new Error('"urlPrefix" not specified for paginate().');
	}
	if (!documentsPerPage) {
		throw new Error('"documentsPerPage" not specified for paginate().');
	}
	if (!layout) {
		throw new Error('"layout" not specified for paginate().');
	}

	let totalPages = Math.ceil(documents.length / documentsPerPage);

	return _.range(totalPages).map((pageNumber) => {
		pageNumber++;
		let sourcePath = getPageNumberUrl(sourcePathPrefix, pageNumber, { index });
		let url = getPageNumberUrl(urlPrefix, pageNumber);
		let begin = (pageNumber - 1) * documentsPerPage;
		return {
			...extra,
			previousUrl: pageNumber > 1 ? getPageNumberUrl(urlPrefix, pageNumber - 1) : null,
			nextUrl: pageNumber < totalPages ? getPageNumberUrl(urlPrefix, pageNumber + 1) : null,
			documents: documents.slice(begin, begin + documentsPerPage),
			sourcePath,
			layout,
			url
		};
	});
}

/**
 * Create context for page rendering: merges document, config and helpers into one object.
 *
 * @param {Object} document
 * @param {Object} config
 * @param {Object} helpers
 * @return {Object}
 */
export function makeContext(document, config, helpers) {
	return {
		...helpers,
		config,
		...document
	};
}

/**
 * Generate page.
 *
 * @param {Object} document
 * @param {Object} config
 * @param {Object} helpers
 * @param {Object} renderers {extension: renderFunction}
 * @return {Object} { pagePath, content }
 */
export function generatePage(document, config, helpers, renderers) {
	if (!document.sourcePath) {
		throw new Error(`Source path not specified. Add "sourcePath" front matter field.`);
	}
	if (!document.layout) {
		throw new Error(`Layout not specified for ${document.sourcePath}. Add "layout" front matter field.`);
	}

	let [templateExtension, render] = _.pairs(renderers).shift();
	let templateFile = `${document.layout}.${templateExtension}`;

	let pageContext = makeContext(document, config, helpers);
	let content = render(templateFile, pageContext);

	let pageExtension = getExtension(document.layout);
	if (!pageExtension) {
		pageExtension = 'html';
	}
	let pagePath = removeExtension(document.sourcePath) + `.${pageExtension}`;

	return {
		pagePath,
		content
	};
}

/**
 * Generate pages.
 *
 * @param {Array} documents
 * @param {Object} config
 * @param {Object} helpers
 * @param {Object} renderers {extension: renderFunction}
 * @return {Array} [{ pagePath, content }, ...]
 */
export function generatePages(documents, config, helpers, renderers) {
	return documents.map(document => generatePage(document, config, helpers, renderers));
}

/**
 * Saves page to a disk.
 *
 * @param {Object} page
 * @param {String} folder Folder to save files.
 */
export function savePage(page, folder) {
	writeFile(path.join(folder, page.pagePath), page.content);
}

/**
 * Saves pages to a disk.
 *
 * @param {Array} pages
 * @param {String} folder Folder to save files.
 */
export function savePages(pages, folder) {
	pages.forEach(page => savePage(page, folder));
}
