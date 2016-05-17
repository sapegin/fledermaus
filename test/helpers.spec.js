import { expect } from 'chai';

import * as helpers from '../src/helpers';

describe('helpers', () => {
	describe('option', () => {
		it('should return localized config option', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						title: 'My blog',
					},
					ru: {
						title: 'Мой блог',
					},
				},
				lang: 'ru',
			});
			let result = func('title');
			expect(result).to.eql('Мой блог');
		});
		it('should return base config option if there’s no language', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func('title');
			expect(result).to.eql('My blog');
		});
		it('should return return top-level value if localized or base value not found', () => {
			let func = helpers.option.bind({
				config: {
					title: 'My blog',
				},
			});
			let result = func('title');
			expect(result).to.eql('My blog');
		});
		it('should support dot notation for keys (key.subkey)', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						foo: {
							bar: 'Baz',
						},
					},
				},
			});
			let result = func('foo.bar');
			expect(result).to.eql('Baz');
		});
		it('should throw if option is not specifeid in the config', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						foo: 42,
					},
				},
			});
			expect(() => func('bar')).to.throw(Error);
		});
	});

	describe('pageLang', () => {
		it('should return page language if it is specified', () => {
			let func = helpers.pageLang.bind({
				config: {
					base: {
						lang: 'en',
					},
				},
				lang: 'ru',
			});
			let result = func();
			expect(result).to.eql('ru');
		});
		it('should return config language if page language is not specified', () => {
			let func = helpers.pageLang.bind({
				option: helpers.option,
				config: {
					base: {
						lang: 'en',
					},
				},
			});
			let result = func();
			expect(result).to.eql('en');
		});
	});

	describe('__', () => {
		it('should return localized config option with expanded {} templates', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				config: {
					base: {
						hi: 'Hello {name}!',
					},
					ru: {
						hi: 'Привет, {name}!',
					},
				},
				lang: 'ru',
			});
			let result = func('hi', { name: 'Fledermaus' });
			expect(result.toString()).to.eql('Привет, Fledermaus!');
		});
		it('should return plural form of a number (English)', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				config: {
					base: {
					},
					en: {
						posts: `{num, plural, =0 {No posts} =1 {One post} other {# posts}}`,
					},
				},
				lang: 'en',
			});
			expect(func('posts', { num: 0 }).toString()).to.eql('No posts');
			expect(func('posts', { num: 1 }).toString()).to.eql('One post');
			expect(func('posts', { num: 2 }).toString()).to.eql('2 posts');
			expect(func('posts', { num: 11 }).toString()).to.eql('11 posts');
			expect(func('posts', { num: 21 }).toString()).to.eql('21 posts');
		});
		it('should return plural form of a number (Russian)', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				config: {
					base: {
					},
					ru: {
						posts: `{num, plural, =0 {Нет постов} =1 {Один пост} one {# пост} few {# поста} many {# постов} other {# поста}}`,
					},
				},
				lang: 'ru',
			});
			expect(func('posts', { num: 0 }).toString()).to.eql('Нет постов');
			expect(func('posts', { num: 1 }).toString()).to.eql('Один пост');
			expect(func('posts', { num: 2 }).toString()).to.eql('2 поста');
			expect(func('posts', { num: 5 }).toString()).to.eql('5 постов');
			expect(func('posts', { num: 11 }).toString()).to.eql('11 постов');
			expect(func('posts', { num: 121 }).toString()).to.eql('121 пост');
		});
	});

	describe('absolutizeUrl', () => {
		it('should return absolute URL', () => {
			let func = helpers.absolutizeUrl.bind({
				option: helpers.option,
				config: {
					base: {
						url: 'http://example.com',
					},
				},
			});
			let result = func('/all/post');
			expect(result).to.eql('http://example.com/all/post');
		});
		it('should trim extra slashes', () => {
			let func = helpers.absolutizeUrl.bind({
				option: helpers.option,
				config: {
					base: {
						url: 'http://example.com/',
					},
				},
			});
			let result = func('/all/post');
			expect(result).to.eql('http://example.com/all/post');
		});
	});

	describe('absolutizeLinks', () => {
		it('should make all links and image URLs absolute', () => {
			let func = helpers.absolutizeLinks.bind({
				option: helpers.option,
				config: {
					base: {
						url: 'http://example.com',
					},
				},
			});
			let result = func(`
				<p>Or you can just download <a href="https://github.com/sapegin/dotfiles/blob/master/bin/dlg-error">dlg-error</a> and <a href="/sapegin/dotfiles/blob/master/bin/dlg-prompt">dlg-prompt</a> and put them <a href="/somewhere">somewhere</a> in <code>$PATH</code>:</p>
				<div class="screenshot screenshot_mac">
					<img src="/images/mac__shell_dialog_error.png" alt="AppleScript error message">
				</div>
			`);
			expect(result).to.eql(`
				<p>Or you can just download <a href="https://github.com/sapegin/dotfiles/blob/master/bin/dlg-error">dlg-error</a> and <a href="http://example.com/sapegin/dotfiles/blob/master/bin/dlg-prompt">dlg-prompt</a> and put them <a href="http://example.com/somewhere">somewhere</a> in <code>$PATH</code>:</p>
				<div class="screenshot screenshot_mac">
					<img src="http://example.com/images/mac__shell_dialog_error.png" alt="AppleScript error message">
				</div>
			`);
		});
	});

	describe('getPageTitle', () => {
		it('should return a title with a site name', () => {
			let func = helpers.getPageTitle.bind({
				option: helpers.option,
				title: 'Foo',
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func();
			expect(result).to.eql('Foo — My blog');
		});
		it('should return a title if suffix=false', () => {
			let func = helpers.getPageTitle.bind({
				option: helpers.option,
				title: 'Foo',
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func({ suffix: false });
			expect(result).to.eql('Foo');
		});
		it('should return a page title if is defined', () => {
			let func = helpers.getPageTitle.bind({
				option: helpers.option,
				title: 'Foo',
				pageTitle: 'Bar',
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func();
			expect(result).to.eql('Bar');
		});
		it('should return site title if title is not defined', () => {
			let func = helpers.getPageTitle.bind({
				option: helpers.option,
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func();
			expect(result).to.eql('My blog');
		});
		it('should return a passed title and suffix if title is not defined', () => {
			let func = helpers.getPageTitle.bind({
				option: helpers.option,
				config: {
					base: {
						title: 'My blog',
					},
				},
			});
			let result = func({ title: 'My custom title' });
			expect(result).to.eql('My custom title — My blog');
		});
	});

	describe('dateToString', () => {
		it('should return date in English format', () => {
			let func = helpers.dateToString.bind({
				pageLang: helpers.pageLang,
				lang: 'en',
			});
			let result = func(new Date(1445543242080));
			expect(result).to.eql('October 22, 2015');
		});
		it('should return date in Russian', () => {
			let func = helpers.dateToString.bind({
				pageLang: helpers.pageLang,
				lang: 'ru',
			});
			let result = func(new Date(1445543242080));
			expect(result).to.eql('22 октября 2015 г.');
		});
	});

	describe('assetFilepath', () => {
		it('should return a path for a static file', () => {
			let func = helpers.assetFilepath.bind({
				option: helpers.option,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func('images/photo.jpg');
			expect(result).to.eql('test/samples/images/photo.jpg');
		});
	});

	describe('fingerprint', () => {
		it('should return a fingerprinted URL for a static file', () => {
			let func = helpers.fingerprint.bind({
				option: helpers.option,
				assetFilepath: helpers.assetFilepath,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func('file.txt');
			expect(result).to.match(/^file.txt\?[0-9a-f]{32}$/);
		});
	});

	describe('embedFile', () => {
		it('should return a static file content', () => {
			let func = helpers.embedFile.bind({
				option: helpers.option,
				assetFilepath: helpers.assetFilepath,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func('file.txt');
			expect(result).to.eql('Hello.');
		});
	});

	describe('inlineFile', () => {
		it('should return a static file content with a comment', () => {
			let func = helpers.inlineFile.bind({
				option: helpers.option,
				assetFilepath: helpers.assetFilepath,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func('file.txt');
			expect(result).to.eql('/*file*/Hello.');
		});
	});

	describe('typo', () => {
		it('should enhance typography for body text', () => {
			let func = helpers.typo.bind({
				pageLang: helpers.pageLang,
				lang: 'en',
			});
			let result = func('no-no');
			expect(result).to.be.an('object');
			expect(result.innerHTML).to.eql('<nobr>no-no</nobr>');
		});
	});

	describe('typoTitle', () => {
		it('should enhance typography for titles', () => {
			let func = helpers.typoTitle.bind({
				pageLang: helpers.pageLang,
				lang: 'en',
			});
			let result = func('No &amp; No');
			expect(result).to.be.an('object');
			expect(result.innerHTML).to.eql('No\xA0<span class="amp">&amp;</span> No');
		});
	});

	describe('json', () => {
		it('should return json string', () => {
			let func = helpers.json;
			let result = func({ a: 42 });
			expect(result).to.be.an('object');
			expect(result.innerHTML).to.eql('{"a":42}');
		});
	});

	describe('Script', () => {
		it('should return a script tag', () => {
			let func = helpers.Script.bind({
				inlineFile: helpers.inlineFile,
				fingerprint: helpers.fingerprint,
				assetFilepath: helpers.assetFilepath,
				option: helpers.option,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func({ src: 'file.txt' });
			expect(result.type).to.eql('script');
			expect(result.attrs.src).to.match(/^file.txt\?[0-9a-f]{32}$/);
			expect(result.children).to.eql([undefined]);
		});
		it('should return a script tag with inlined script', () => {
			let func = helpers.Script.bind({
				inlineFile: helpers.inlineFile,
				fingerprint: helpers.fingerprint,
				assetFilepath: helpers.assetFilepath,
				option: helpers.option,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func({ src: 'file.txt', inline: true });
			expect(result.type).to.eql('script');
			expect(result.attrs).to.eql({});
			expect(result.children[0].innerHTML).to.eql('/*file*/Hello.');
		});
	});

	describe('Style', () => {
		it('should return a link tag', () => {
			let func = helpers.Style.bind({
				inlineFile: helpers.inlineFile,
				fingerprint: helpers.fingerprint,
				assetFilepath: helpers.assetFilepath,
				option: helpers.option,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func({ src: 'file.txt' });
			expect(result.type).to.eql('link');
			expect(result.attrs.href).to.match(/^file.txt\?[0-9a-f]{32}$/);
			expect(result.attrs.rel).to.eql('stylesheet');
			expect(result.children).to.eql(false);
		});
		it('should return a style tag with inlined style', () => {
			let func = helpers.Style.bind({
				inlineFile: helpers.inlineFile,
				fingerprint: helpers.fingerprint,
				assetFilepath: helpers.assetFilepath,
				option: helpers.option,
				config: {
					base: {
						assetsFolder: 'test/samples',
					},
				},
			});
			let result = func({ src: 'file.txt', inline: true });
			expect(result.type).to.eql('style');
			expect(result.attrs).to.eql({});
			expect(result.children[0].innerHTML).to.eql('/*file*/Hello.');
		});
	});
});
