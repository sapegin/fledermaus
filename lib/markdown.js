import marked from 'marked';
import hljs from 'highlight.js';

hljs.configure({
	tabReplace: null
});

const hljsAliases = {
	yaml: 'python',
	shell: 'bash'
};

class Renderer extends marked.Renderer {
	// Do not put IDs in headers
	heading(text, level, raw) {
		let tag = `h${level}`;
		return `<${tag}>${text}</${tag}>\n`;
	}
};

export default function render(source) {
	return marked(source, {
		renderer: new Renderer(),
		highlight: function(code, lang) {
			if (lang) {
				return hljs.highlight(hljsAliases[lang] || lang, code).value;
			}
			else {
				return hljs.highlightAuto(code).value;
			}
		}
	});
};
