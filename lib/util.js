/**
 * Simple templates: {key}.
 * 
 * @param {String} template Template.
 * @param {Object} params Substitutions.
 * @return {String}
 */
export function tmpl(template, params = {}) {
	return template.replace(/\{([^\}]+)\}/g, (m, key) => params[key] || m);
}

/**
 * Returns HTML meta tag.
 * 
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */
export function meta(name, content) {
	return `<meta name="${name}" content="${content}">`;
}

/**
 * Returns HTML meta tag for Open Graph.
 * 
 * @param {String} name Meta name.
 * @param {String} content Meta value.
 * @return {String}
 */
export function og(name, content) {
	return `<meta property="${name}" content="${content}">`;
}
