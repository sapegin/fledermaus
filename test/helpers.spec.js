import { expect } from 'chai';

import * as helpers from '../src/helpers';

describe('helpers', () => {

	describe('option', () => {
		it('should return localized config option', () => {
			let func = helpers.option.bind({
				config: {
					default: {
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
					default: {
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
					default: {
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
					default: {
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
					default: {
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
				config: {
					default: {
						hi: 'Hello {name}!'
					},
					ru: {
						hi: 'Привет, {name}!'
					}
				},
				lang: 'ru'
			});
			let result = func('hi', {name: 'Sweet2'});
			expect(result).to.eql('Привет, Sweet2!');
		});
	});

	describe('plural', () => {
		it('should return plural form of a number (English)', () => {
			let func = helpers.plural.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				__: helpers.__,
				config: {
					default: {
					},
					en: {
						posts: 'post|posts'
					}
				},
				lang: 'en'
			});
			expect(func(1, 'posts')).to.eql('post');
			expect(func(2, 'posts')).to.eql('posts');
			expect(func(11, 'posts')).to.eql('posts');
			expect(func(21, 'posts')).to.eql('posts');
		});
		it('should return plural form of a number (Russian)', () => {
			let func = helpers.plural.bind({
				option: helpers.option,
				pageLang: helpers.pageLang,
				__: helpers.__,
				config: {
					default: {
					},
					ru: {
						posts: 'пост|поста|постов'
					}
				},
				lang: 'ru'
			});
			expect(func(1, 'posts')).to.eql('пост');
			expect(func(2, 'posts')).to.eql('поста');
			expect(func(5, 'posts')).to.eql('постов');
			expect(func(11, 'posts')).to.eql('постов');
			expect(func(21, 'posts')).to.eql('пост');
		});
	});

	describe('pageUrl', () => {
		it('should return URL without changes', () => {
			let result = helpers.pageUrl('/all/post');
			expect(result).to.eql('/all/post');
		});
	});

	describe('pageAbsUrl', () => {
		it('should return absolute URL', () => {
			let func = helpers.pageAbsUrl.bind({
				option: helpers.option,
				pageUrl: helpers.pageUrl,
				config: {
					default: {
						url: 'http://example.com'
					}
				}
			});
			let result = func('/all/post');
			expect(result).to.eql('http://example.com/all/post');
		});
		it('should trim extra slashes', () => {
			let func = helpers.pageAbsUrl.bind({
				option: helpers.option,
				pageUrl: helpers.pageUrl,
				config: {
					default: {
						url: 'http://example.com/'
					}
				}
			});
			let result = func('/all/post');
			expect(result).to.eql('http://example.com/all/post');
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

	describe('dateToISOString', () => {
		it('should return ISO date', () => {
			let result = helpers.dateToISOString(new Date(1445543242080));
			expect(result).to.eql('2015-10-22T19:47:22.080Z');
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
					default: {
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
					default: {
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
					default: {
						assetsFolder: 'test/samples'
					}
				}
			});
			let result = func('file.txt');
			expect(result).to.eql('Hello.');
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
			expect(result).to.eql('No <span class="amp">&amp;</span> No');
		});
	});



});
