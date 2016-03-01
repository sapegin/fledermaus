import fs from 'fs';
import { expect } from 'chai';
import rimraf from 'rimraf';

import * as util from '../src/util';

describe('util', () => {

	describe('removeExtension', () => {
		it('should remove extension from file path', () => {
			let result = util.removeExtension('ru/markdown.md');
			expect(result).to.eql('ru/markdown');
		});
	});

	describe('getExtension', () => {
		it('should return file extension', () => {
			let result = util.getExtension('ru/markdown.md');
			expect(result).to.eql('md');
		});
	});

	describe('readFile', () => {
		it('should return a file content', () => {
			let result = util.readFile('test/samples/file.txt');
			expect(result).to.eql('Hello.');
		});
	});

	describe('writeFile', () => {
		beforeEach(done => rimraf('test/tmp', done));
		it('should saves a string to a file on a disk', () => {
			const filepath = 'test/tmp/file.txt';
			util.writeFile(filepath, 'Hello.');
			expect(fs.existsSync(filepath)).to.be.true;
			expect(fs.readFileSync(filepath, {encoding: 'utf8'})).to.eql('Hello.');
		});
	});

	describe('readYamlFile', () => {
		it('should read and parse YAML file', () => {
			let result = util.readYamlFile('test/samples/file.yml');
			expect(result).to.eql({hello: 'world'});
		});
	});

	describe('formatFieldsForSortByOrder', () => {
		it('should prepare fields list in short format to _.orderBy()', () => {
			let result = util.formatFieldsForSortByOrder(['foo', '-bar']);
			expect(result).to.eql([['foo', 'bar'], ['asc', 'desc']]);
		});
	});

	describe('meta', () => {
		it('should return HTML meta tag', () => {
			let result = util.meta('description', 'My blog');
			expect(result).to.eql('<meta name="description" content="My blog">');
		});
		it('should clean HTML tag', () => {
			let result = util.meta('description', 'My <b>"blog"</b>');
			expect(result).to.eql('<meta name="description" content="My &quot;blog&quot;">');
		});
	});

	describe('og', () => {
		it('should return HTML meta tag for Open Graph', () => {
			let result = util.og('description', 'My blog');
			expect(result).to.eql('<meta property="description" content="My blog">');
		});
		it('should clean HTML tag', () => {
			let result = util.og('description', 'My <b>"blog"</b>');
			expect(result).to.eql('<meta property="description" content="My &quot;blog&quot;">');
		});
	});

	describe('getFirstParagraph', () => {
		it('should return the content of the first paragraph in a given HTML', () => {
			let result = util.getFirstParagraph(`
					<p>And so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going though the little door into that lovely garden.</p>
					<p>First, however, she waited for a few minutes to see if she was going to shrink any further: she felt a little nervous about this; ‘for it might end, you know,’ said Alice to herself, ‘in my going out altogether, like a candle. I wonder what I should be like then?’</p>
					<p>And she tried to fancy what the flame of a candle is like after the candle is blown out, for she could not remember ever having seen such a thing.</p>
			`);
			expect(result).to.eql('And so it was indeed: she was now only ten inches high, and her face brightened up at the thought that she was now the right size for going though the little door into that lovely garden.');
		});
	});

	describe('getFirstImage', () => {
		it('should return the URL of the first image in a given HTML', () => {
			let result = util.getFirstImage(`
					<p>And so it was indeed: "she" was now only ten inches < high.</p>
					<img src="/images/facepalm.jpg" with="120" height="80">
					<p>And she tried to fancy what the flame of a candle is like after the candle is blown out.</p>
			`);
			expect(result).to.eql('/images/facepalm.jpg');
		});
	});

	describe('cleanHtml', () => {
		it('should remove HTML and escape special characters in a given HTML', () => {
			let result = util.cleanHtml(`
					<p>And so it was indeed: "she" was now only ten inches < high.</p>
					<img src="facepalm.jpg" with="120" height="80">
			`);
			expect(result).to.eql('And so it was indeed: &quot;she&quot; was now only ten inches &lt; high.');
		});
	});

});
