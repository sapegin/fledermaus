import path from 'path';
import glob from 'glob';
import fastmatter from 'fastmatter';
import _ from 'lodash';

import { getExtension, removeExtension, readFile, writeFile, readYamlFile } from './util';

export function filepathToUrl(filename) {
	return '/' + removeExtension(filename);
}

export function renderByType(source, filepath, renderers={}) {
	let extension = getExtension(filepath);
	let render = renderers[extension];
	if (_.isFunction(render)) {
		return render(source);
	}
	return source;
}

export function parsePage(source, filepath, renderers={}) {
	let { attributes, body } = fastmatter(source);

	let content = renderByType(body, filepath, renderers);
	let url = filepathToUrl(filepath);

	return _.merge(attributes, {
		sourcePath: filepath,
		content,
		url
	});
}

export function getSourceFilesList(mask) {
	return glob.sync(mask);
}

export function loadSourceFiles(mask) {
	let files = getSourceFilesList(mask);
	return files.map(readFile);
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

export function makeContext(page, config, helpers) {
	return _.merge({}, helpers, { config }, page);
}

export function generatePage(page, config, helpers, renderTemplate) {
	let context = makeContext(page, config, helpers);
	return {
		pagePath: page.sourcePath, 
		content: renderTemplate(`${page.layout}.ect`, context)
	};
}

export function generatePages(pages, config, helpers, renderTemplate) {
	return pages.map(page => generatePage(page, config, helpers, renderTemplate));
}

export function savePage(page, folder) {
	writeFile(path.join(folder, `${page.pagePath}.html`), page.content);
}

export function savePages(pages, folder) {
	return pages.map(page => savePage(page, folder));
}
