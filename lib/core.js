import path from 'path';
import glob from 'glob';
import fastmatter from 'fastmatter';
import _ from 'lodash';

import renderMarkdown from './markdown';
import renderTemplate from './template';
import { readFile, writeFile, readYamlFile } from './util';

export function removeExtension(filename) {
	return filename.replace(/\.\w+$/, '');
}

export function filepathToUrl(filename) {
	return '/' + removeExtension(filename);
}

export function parsePage(source, filepath) {
	let { attributes, body } = fastmatter(source);
	let extension = path.extname(filepath);
	if (extension === '.md') {
		body = renderMarkdown(body);
	}
	return _.merge(attributes, {
		sourcePath: filepath,
		url: filepathToUrl(filepath),
		content: body
	});
}

export function getSourceFilesList(folder) {
	return glob.sync(path.join(folder, '**/*.{md,html}'));
}

export function loadSourceFiles(folder) {
	let files = getSourceFilesList(folder);
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

export function generatePage(page, config, helpers) {
	let context = makeContext(page, config, helpers);
	return {
		pagePath: page.sourcePath, 
		content: renderTemplate(`${page.layout}.ect`, context)
	};
}

export function generatePages(pages, config, helpers) {
	return pages.map(page => generatePage(page, config, helpers));
}

export function savePage(page, folder) {
	writeFile(path.join(folder, `${page.pagePath}.html`), page.content);
}

export function savePages(pages, folder) {
	return pages.map(page => savePage(page, folder));
}
