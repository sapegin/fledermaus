import fs from 'fs';
import rimraf from 'rimraf';

import * as util from '../src/util';

describe('util', () => {
	describe('removeExtension', () => {
		it('should remove extension from file path', () => {
			const result = util.removeExtension('ru/markdown.md');
			expect(result).toEqual('ru/markdown');
		});
	});

	describe('getExtension', () => {
		it('should return file extension', () => {
			const result = util.getExtension('ru/markdown.md');
			expect(result).toEqual('md');
		});
	});

	describe('readFile', () => {
		it('should return a file content', () => {
			const result = util.readFile('test/samples/file.txt');
			expect(result).toEqual('Hello.');
		});
	});

	describe('writeFile', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should saves a string to a file on a disk', () => {
			const filepath = 'test/tmp/file.txt';
			util.writeFile(filepath, 'Hello.');
			expect(fs.existsSync(filepath)).toBe(true);
			expect(fs.readFileSync(filepath, { encoding: 'utf8' })).toEqual('Hello.');
		});
	});

	describe('readYamlFile', () => {
		it('should read and parse YAML file', () => {
			const result = util.readYamlFile('test/samples/file.yml');
			expect(result).toEqual({ hello: 'world' });
		});
	});

	describe('formatFieldsForSortByOrder', () => {
		it('should prepare fields list in short format to _.orderBy()', () => {
			const result = util.formatFieldsForSortByOrder(['foo', '-bar']);
			expect(result).toEqual([['foo', 'bar'], ['asc', 'desc']]);
		});
	});

	describe('meta', () => {
		it('should return HTML meta tag', () => {
			const result = util.meta('description', 'My blog');
			expect(result.toString()).toEqual(
				'<meta name="description" content="My blog">'
			);
		});
		it('should strip HTML and escape special characters', () => {
			const result = util.meta('description', 'My <b>"blog"</b>');
			expect(result.toString()).toEqual(
				'<meta name="description" content="My &quot;blog&quot;">'
			);
		});
		it('should work with numbers', () => {
			const result = util.meta('description', 42);
			expect(result.toString()).toEqual(
				'<meta name="description" content="42">'
			);
		});
	});

	describe('og', () => {
		it('should return HTML meta tag for Open Graph', () => {
			const result = util.og('description', 'My blog');
			expect(result.toString()).toEqual(
				'<meta property="description" content="My blog">'
			);
		});
		it('should strip HTML and escape special characters', () => {
			const result = util.og('description', 'My <b>"blog"</b>');
			expect(result.toString()).toEqual(
				'<meta property="description" content="My &quot;blog&quot;">'
			);
		});
		it('should work with numbers', () => {
			const result = util.og('description', 42);
			expect(result.toString()).toEqual(
				'<meta property="description" content="42">'
			);
		});
	});

	describe('getFirstParagraph', () => {
		it('should return the content of the first paragraph in a given HTML', () => {
			const result = util.getFirstParagraph(`
					<p>And so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going though the little door into that lovely garden.</p>
					<p>First, however, she waited for a few minutes to see if she was going to shrink any further: she felt a little nervous about this; ‘for it might end, you know,’ said Alice to herself, ‘in my going out altogether, like a candle. I wonder what I should be like then?’</p>
					<p>And she tried to fancy what the flame of a candle is like after the candle is blown out, for she could not remember ever having seen such a thing.</p>
			`);
			expect(result).toEqual(
				'And so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going though the little door into that lovely garden.'
			);
		});
	});

	describe('getFirstImage', () => {
		it('should return the URL of the first image in a given HTML', () => {
			const result = util.getFirstImage(`
					<p>And so it was indeed: "she" was now only ten inches < high.</p>
					<img src="/images/facepalm.jpg" with="120" height="80">
					<p>And she tried to fancy what the flame of a candle is like after the candle is blown out.</p>
			`);
			expect(result).toEqual('/images/facepalm.jpg');
		});
	});

	describe('absolutizeUrl', () => {
		it('should return absolute URL', () => {
			const result = util.absolutizeUrl('/all/post', 'http://example.com');
			expect(result).toEqual('http://example.com/all/post');
		});
		it('should trim extra slashes', () => {
			const result = util.absolutizeUrl('/all/post', 'http://example.com/');
			expect(result).toEqual('http://example.com/all/post');
		});
		it('should return absolute URLs as is', () => {
			const result = util.absolutizeUrl(
				'http://example.com/all/post',
				'http://example.com/'
			);
			expect(result).toEqual('http://example.com/all/post');
		});
	});

	describe('absolutizeLinks', () => {
		it('should make all links and image URLs absolute', () => {
			const result = util.absolutizeLinks(
				`
				<p>Or you can just download <a href="https://github.com/sapegin/dotfiles/blob/master/bin/dlg-error">dlg-error</a> and <a href="/sapegin/dotfiles/blob/master/bin/dlg-prompt">dlg-prompt</a> and put them <a href="/somewhere">somewhere</a> in <code>$PATH</code>:</p>
				<div class="screenshot screenshot_mac">
					<img src="/images/mac__shell_dialog_error.png" alt="AppleScript error message">
				</div>
			`,
				'http://example.com'
			);
			expect(result).toEqual(`
				<p>Or you can just download <a href="https://github.com/sapegin/dotfiles/blob/master/bin/dlg-error">dlg-error</a> and <a href="http://example.com/sapegin/dotfiles/blob/master/bin/dlg-prompt">dlg-prompt</a> and put them <a href="http://example.com/somewhere">somewhere</a> in <code>$PATH</code>:</p>
				<div class="screenshot screenshot_mac">
					<img src="http://example.com/images/mac__shell_dialog_error.png" alt="AppleScript error message">
				</div>
			`);
		});
	});

	describe('cleanHtml', () => {
		it('should remove HTML and escape special characters in a given HTML', () => {
			const result = util.cleanHtml(`
					<p>And so it was indeed: "she" was now only ten inches < high.</p>
					<img src="facepalm.jpg" with="120" height="80">
			`);
			expect(result).toEqual(
				'And so it was indeed: &quot;she&quot; was now only ten inches &lt; high.'
			);
		});
	});

	describe('markdownBlock', () => {
		it('should return rendered to HTML Markdown', () => {
			const result = util.markdownBlock('Hello *world*!');
			expect(result).toEqual('<p>Hello <em>world</em>!</p>\n');
		});
	});

	describe('markdown', () => {
		it('should return rendered to HTML Markdown not wrapped in a paragraph', () => {
			const result = util.markdown('Hello *world*!');
			expect(result).toEqual('Hello <em>world</em>!');
		});
	});

	describe('formatErrorHtml', () => {
		it('should escape HTML and replace new line character with <br>', () => {
			const result = util.formatErrorHtml('Error in <tag>:\nOut of cheese');
			expect(result).toEqual('Error in &lt;tag&gt;:<br>Out of cheese');
		});
	});

	describe('errorHtml', () => {
		it('should return an HTML document', () => {
			const result = util.errorHtml('Error in <tag>');
			expect(result.trim().startsWith('<title>Error</title>')).toBe(true);
			expect(result.includes('Error in &lt;tag&gt;')).toBe(true);
		});
	});

	describe('errorInlineHtml', () => {
		it('should return an HTML', () => {
			const result = util.errorInlineHtml('Error in <tag>');
			expect(result.toString()).toEqual(
				'<b style="color:#c00; font-family:Helvetica">Error in &lt;tag&gt;</b>'
			);
		});
		it('should wrap HTML in a <p> tag', () => {
			const result = util.errorInlineHtml('Error in <tag>', { block: true });
			expect(result.toString()).toEqual(
				'<p><b style="color:#c00; font-family:Helvetica">Error in &lt;tag&gt;</b></p>'
			);
		});
	});

	describe('codeFragment', () => {
		it('should return a code fragment with line numbers', () => {
			const code = util.readFile('test/samples/code.ect');
			const result = util.codeFragment(code, 8);
			expect(result).toEqual(util.readFile('test/expected/code-snippet.txt'));
		});
	});

	describe('getComponentStack', () => {
		it('should return formatter stack trace', () => {
			const result = util.getComponentStack(`RangeError: Invalid valid date passed to format
at CreateDateTimeParts (/Users/tema/_/fledermaus/node_modules/intl/lib/core.js:3885:29)
at FormatDateTime (/Users/tema/_/fledermaus/node_modules/intl/lib/core.js:4079:17)
at DateTimeFormatConstructor.F (/Users/tema/_/fledermaus/node_modules/intl/lib/core.js:3848:20)
at Object.dateToString (/Users/tema/_/fledermaus/lib/helpers.js:197:17)
at _default (/Users/tema/_/morning.photos/templates/components/PostMeta.jsx:22:6)
at vdo (/Users/tema/_/fledermaus/node_modules/vdo/lib/index.js:37:14)
at _default (/Users/tema/_/morning.photos/templates/components/PostExcerpt.jsx:67:21)
at vdo (/Users/tema/_/fledermaus/node_modules/vdo/lib/index.js:37:14)
at /Users/tema/_/morning.photos/templates/Posts.jsx:32:12
at Array.map (<anonymous>)`);
			expect(result).toEqual(
				'components/PostMeta.jsx <- components/PostExcerpt.jsx <- templates/Posts.jsx'
			);
		});
	});
});
