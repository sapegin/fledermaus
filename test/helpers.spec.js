import { expect } from 'chai';

import * as helpers from '../src/helpers';

describe('helpers', () => {

	describe('option', () => {
		it('should return localized config option', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						title: 'My blog'
					},
					ru: {
						title: 'Мой блог'
					},
				},
				lang: 'ru'
			});
			let result = func('title');
			expect(result).to.eql('Мой блог');
		});
		it('should support dot notation for keys (key.subkey)', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						foo: {
							bar: 'Baz'
						}
					}
				}
			});
			let result = func('foo.bar');
			expect(result).to.eql('Baz');
		});
		it('should throw if option is not specifeid in the config', () => {
			let func = helpers.option.bind({
				config: {
					base: {
						foo: 42
					}
				}
			});
			expect(() => func('bar')).to.throw(Error);
		});
	});

	describe('pageLang', () => {
		it('should return page language if it is specified', () => {
			let func = helpers.pageLang.bind({
				config: {
					base: {
						lang: 'en'
					}
				},
				lang: 'ru'
			});
			let result = func();
			expect(result).to.eql('ru');
		});
		it('should return config language if page language is not specified', () => {
			let func = helpers.pageLang.bind({
				option: helpers.option,
				config: {
					base: {
						lang: 'en'
					}
				}
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
						hi: 'Hello {name}!'
					},
					ru: {
						hi: 'Привет, {name}!'
					}
				},
				lang: 'ru'
			});
			let result = func('hi', {name: 'Fledermaus'});
			expect(result).to.eql('Привет, Fledermaus!');
		});
		it('should return plural form of a number (English)', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				config: {
					base: {
					},
					en: {
						posts: `{num, plural, =0 {No posts} =1 {One post} other {# posts}}`
					}
				},
				lang: 'en'
			});
			expect(func('posts', {num: 0})).to.eql('No posts');
			expect(func('posts', {num: 1})).to.eql('One post');
			expect(func('posts', {num: 2})).to.eql('2 posts');
			expect(func('posts', {num: 11})).to.eql('11 posts');
			expect(func('posts', {num: 21})).to.eql('21 posts');
		});
		it('should return plural form of a number (Russian)', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				config: {
					base: {
					},
					ru: {
						posts: `{num, plural, =0 {Нет постов} =1 {Один пост} one {# пост} few {# поста} many {# постов} other {# поста}}`
					}
				},
				lang: 'ru'
			});
			expect(func('posts', {num: 0})).to.eql('Нет постов');
			expect(func('posts', {num: 1})).to.eql('Один пост');
			expect(func('posts', {num: 2})).to.eql('2 поста');
			expect(func('posts', {num: 5})).to.eql('5 постов');
			expect(func('posts', {num: 11})).to.eql('11 постов');
			expect(func('posts', {num: 121})).to.eql('121 пост');
		});
	});

	describe('absolutizeUrl', () => {
		it('should return absolute URL', () => {
			let func = helpers.absolutizeUrl.bind({
				option: helpers.option,
				config: {
					base: {
						url: 'http://example.com'
					}
				}
			});
			let result = func('/all/post');
			expect(result).to.eql('http://example.com/all/post');
		});
		it('should trim extra slashes', () => {
			let func = helpers.absolutizeUrl.bind({
				option: helpers.option,
				config: {
					base: {
						url: 'http://example.com/'
					}
				}
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
						url: 'http://example.com'
					}
				}
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

	describe('isHome', () => {
		it('should return true if page is index page', () => {
			let func = helpers.isHome.bind({
				url: '/'
			});
			let result = func();
			expect(result).to.be.true;
		});
		it('should return false if page is not index page', () => {
			let func = helpers.isHome.bind({
				url: '/about'
			});
			let result = func();
			expect(result).to.be.false;
		});
	});

	describe('dateToString', () => {
		it('should return date in English format', () => {
			let func = helpers.dateToString.bind({
				pageLang: helpers.pageLang,
				lang: 'en'
			});
			let result = func(new Date(1445543242080));
			expect(result).to.eql('October 22, 2015');
		});
		it('should return date in Russian', () => {
			let func = helpers.dateToString.bind({
				pageLang: helpers.pageLang,
				lang: 'ru'
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
						assetsFolder: 'test/samples'
					}
				}
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
						assetsFolder: 'test/samples'
					}
				}
			});
			let result = func('file.txt');
			expect(result).to.match(/^file.txt\?\d{13}$/);
		});
	});

	describe('embedFile', () => {
		it('should return a static file content', () => {
			let func = helpers.embedFile.bind({
				option: helpers.option,
				assetFilepath: helpers.assetFilepath,
				config: {
					base: {
						assetsFolder: 'test/samples'
					}
				}
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
						assetsFolder: 'test/samples'
					}
				}
			});
			let result = func('file.txt');
			expect(result).to.eql('/*file*/Hello.');
		});
	});

	describe('rt', () => {
		it('should enhance typography for body text', () => {
			let func = helpers.rt.bind({
				pageLang: helpers.pageLang,
				lang: 'en'
			});
			let result = func('no-no');
			expect(result).to.eql('<nobr>no-no</nobr>');
		});
	});

	describe('rtt', () => {
		it('should enhance typography for titles', () => {
			let func = helpers.rtt.bind({
				pageLang: helpers.pageLang,
				lang: 'en'
			});
			let result = func('No &amp; No');
			expect(result).to.eql('No\xA0<span class="amp">&amp;</span> No');
		});
	});



});
