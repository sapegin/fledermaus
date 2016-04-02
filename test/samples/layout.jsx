export default function({ title, content }) {
	return vdo('div', null, [
		vdo('h1', null, title),
		vdo.markSafe(content)
	]);
}
