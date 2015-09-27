import { expect } from 'chai';

import * as helpers from '../lib/helpers';

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
	});

	describe('__', () => {
		it('should return localized config option with expanded {} templates', () => {
			let func = helpers.__.bind({
				option: helpers.option,
				config: {
					default: {
						strings: {
							hi: 'Hello {name}!'
						}
					},
					ru: {
						strings: {
							hi: 'Привет, {name}!'
						}
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
				__: helpers.__,
				config: {
					default: {
					},
					en: {
						strings: {
							posts: 'post|posts'
						}
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
				__: helpers.__,
				config: {
					default: {
					},
					ru: {
						strings: {
							posts: 'пост|поста|постов'
						}
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

});
