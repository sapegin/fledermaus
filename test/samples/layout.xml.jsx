export default function({ content }) {
	return vdo('foo', null, vdo.markSafe(content));
}
