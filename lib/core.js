import fs from 'fs';
import path from 'path';
import glob from 'glob';
import yaml from 'js-yaml';
import fastmatter from 'fastmatter';
import _ from 'lodash';

import renderMarkdown from './markdown';

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

export function readFile(filepath) {
	return fs.readFileSync(filepath, {encoding: 'utf8'});
}

export function readYamlFile(filepath) {
	try {
		return yaml.safeLoad(readFile(filepath));
	}
	catch (e) {
		console.log(`Cannot read YAML file ${filepath}:`, e);
	}
}

export function readFiles(files) {
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

export function readConfig(folder) {
	let files = getConfigFilesList(folder);
	let configs = readConfigFiles(files);
	return mergeConfigs(configs);
}
