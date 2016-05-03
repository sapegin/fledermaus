import RSS from 'rss';
import { errorHtml } from '../util';

/**
 * Generates RSS.
 *
 * @param {object} props
 * @return {string}
 */
export default function renderRss(props = {}) {
	const missingProp = prop => errorHtml(`Error while rendering an RSS feed ${props.sourcePath}: ` +
		`missing required property "${prop}".`);

	const requiredProps = ['title', 'description', 'items'];
	for (let prop of requiredProps) {
		if (!props[prop]) {
			return missingProp(prop);
		}
	}

	props = {
		...props,
		language: props.lang,
		feed_url: props.absolutizeUrl(props.feedUrl || `${props.url}.xml`),
		site_url: props.absolutizeUrl(props.siteUrl || ''),
		image_url: props.imageUrl && props.absolutizeUrl(props.imageUrl),
		custom_namespaces: props.customNamespaces,
		custom_elements: props.customElements,
	};

	let feed = new RSS(props);

	props.items.forEach(item => {
		feed.item({
			...item,
			url: props.absolutizeUrl(item.url),
			description: props.absolutizeLinks(item.description),
			custom_elements: item.customElements,
		});
	});

	return feed.xml({ indent: true });
}
