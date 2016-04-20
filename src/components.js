import vdo from 'vdo';

export function Group({ glue = ' ', inline = false, ...rest }, children) {
	let items = [];
	children = children.filter(child => !!child);
	children.forEach((item, index) => {
		items.push(item);
		if (index < children.length - 1) {
			items.push(glue);
		}
	});
	let tag = inline ? 'span' : 'div';
	return vdo(tag, rest, items);
}
