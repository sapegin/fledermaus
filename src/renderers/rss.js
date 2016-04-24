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

	props.language = props.lang;
	props.feed_url = props.absolutizeUrl(props.feedUrl || `${props.url}.xml`);
	props.site_url = props.absolutizeUrl(props.siteUrl || '');
	props.image_url = props.imageUrl && props.absolutizeUrl(props.imageUrl);
	props.custom_namespaces = props.customNamespaces;
	props.custom_elements = props.customElements;

	let feed = new RSS(props);

	props.items.forEach(item => {
		item.url = props.absolutizeUrl(item.url);
		item.description = props.absolutizeLinks(item.description);
		item.custom_elements = item.customElements;
		feed.item(item);
	});

	return feed.xml({ indent: true });
}
