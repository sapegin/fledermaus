import path from 'path';
import glob from 'glob';
import fastmatter from 'fastmatter';
import _ from 'lodash';

import { getExtension, removeExtension, readFile, writeFile, readYamlFile } from './util';

export function filepathToUrl(filepath) {
	let url = '/' + removeExtension(filepath)
	url = url.replace(/\/index$/, '');
	if (url === '') {
		return '/';
	}
	return url;
}

export function renderByType(source, filepath, renderers={}) {
	let extension = getExtension(filepath);
	let render = renderers[extension];
	if (_.isFunction(render)) {
		return render(source);
	}
	return source;
}

export function parsePage(source, folder, filepath, renderers={}) {
	let { attributes, body } = fastmatter(source);

	let content = renderByType(body, filepath, renderers);
	let url = filepathToUrl(filepath);

	return _.merge(attributes, {
		sourcePath: filepath,
		content,
		url
	});
}

export function getSourceFilesList(folder, types) {
	let typesMask = types.join(',');
	let mask = `**/*.{${typesMask}}`;
	return glob.sync(mask, {cwd: folder});
}

export function loadSourceFiles(folder, types, renderers={}) {
	let files = getSourceFilesList(folder, types);
	return files.map((filepath) => {
		let source = readFile(path.join(folder, filepath));
		return parsePage(source, folder, filepath, renderers);
	});
}

export function getConfigFilesList(folder) {
	return glob.sync(path.join(folder, '*.yml'));
}

export function readConfigFiles(files) {
	return files.reduce((configs, filepath) => {
		let name = removeExtension(path.basename(filepath));
		if (name === 'default') {
			configs.default = readYamlFile(filepath);
		}
		else {
			configs.langs[name] = readYamlFile(filepath);
		}
		return configs;
	}, {default: {}, langs: {}});  // @todo use really default config
}

export function mergeConfigs(configs) {
	let { langs } = configs;
	if (_.isEmpty(langs)) {
		return {
			default: configs.default
		};
	}

	return Object.keys(langs).reduce((merged, lang) => {
		merged[lang] = _.merge({}, configs.default, langs[lang]);
		return merged;
	}, {});
}

export function loadConfig(folder) {
	let files = getConfigFilesList(folder);
	let configs = readConfigFiles(files);
	return mergeConfigs(configs);
}

export function filterDocuments(documents, regexp, lang) {
	return documents.filter((document) => {
		if (lang && document.lang !== lang) {
			return false;
		}

		return regexp.test(document.sourcePath);
	});
}

export function getPageNumberUrl(urlPrefix, pageNumber) {
	return `${urlPrefix}/page/${pageNumber}`;
}

export function generatePagination(documents, { urlPrefix, documentsPerPage, layout } = {}) {
	if (!urlPrefix) {
		throw new Error(`"urlPrefix" not specified for generatePagination().`);
	}
	if (!documentsPerPage) {
		throw new Error(`"documentsPerPage" not specified for generatePagination().`);
	}
	if (!layout) {
		throw new Error(`"layout" not specified for generatePagination().`);
	}

	let totalPages = Math.ceil(documents.length / documentsPerPage);

	return _.range(totalPages).map((pageNumber) => {
		pageNumber++;
		let url = getPageNumberUrl(urlPrefix, pageNumber);
		let begin = (pageNumber - 1) * documentsPerPage;
		return {
			previousUrl: pageNumber > 1 ? getPageNumberUrl(urlPrefix, pageNumber - 1) : null,
			nextUrl: pageNumber < totalPages ? getPageNumberUrl(urlPrefix, pageNumber + 1) : null,
			sourcePath: url.replace(/^\//, ''),
			documents: documents.slice(begin, begin + documentsPerPage),
			layout,
			url
		};
	});
}

export function makeContext(document, config, helpers) {
	return _.merge({}, helpers, { config }, document);
}

export function generatePage(document, config, helpers, renderers) {
	if (!document.layout) {
		throw new Error(`Layout not specified for ${document.sourcePath}. Add "layout" front matter field.`);
	}

	let [ templateExtension, render ] = _.pairs(renderers).shift();
	let templateFile = `${document.layout}.${templateExtension}`;

	let context = makeContext(document, config, helpers);
	let content = render(templateFile, context);

	return {
		pagePath: removeExtension(document.sourcePath),
		content
	};
}

export function generatePages(documents, config, helpers, renderers) {
	return documents.map(document => generatePage(document, config, helpers, renderers));
}

export function savePage(page, folder) {
	writeFile(path.join(folder, `${page.pagePath}.html`), page.content);
}

export function savePages(pages, folder) {
	return pages.map(page => savePage(page, folder));
}
