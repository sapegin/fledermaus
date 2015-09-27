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
