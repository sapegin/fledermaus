Vladimir Starkov [suggests](http://vstarkov.com/monthbook/) to read at least two technical books a month.

```
// TODO
function readFile(filepath) {
	return fs.readFileSync(filepath, {encoding: 'utf8'});
}
```

It’s very important to be up-to-date with latest trends, especially in so fast changing industry as front-end development. But there are so many interesting subjects besides  programming languages and new frameworks.

```javascript
class Renderer extends marked.Renderer {
	// Do not put IDs in headers
	heading(text, level, raw) {
		let tag = `h${level}`;
		return `<${tag}>${text}</${tag}>\n`;
	}
};
```
