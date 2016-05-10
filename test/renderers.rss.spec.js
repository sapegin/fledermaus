import { expect } from 'chai';

import renderRss from '../src/renderers/rss';
import { readFile } from '../src/util';
import * as helpers from '../src/helpers';

describe('RSS', () => {
	describe('render', () => {
		it('should render an RSS feed', () => {
			let result = renderRss({
				title: 'Hello',
				description: 'My RSS',
				layout: 'RSS',
				url: '/feed',
				sourcePath: 'feed.md',
				items: [
					{
						title: 'Post 1',
						content: 'Hello world 1.',
						url: '/blog/1',
						date: 'Jan 1, 2016',
					},
					{
						title: 'Post 2',
						content: '<p>Read more in <a href="/blog/22">this post</a>.</p>',
						url: '/blog/2',
						date: 'Jan 2, 2016',
					},
				],
				absolutizeUrl: helpers.absolutizeUrl,
				absolutizeLinks: helpers.absolutizeLinks,
				option(key) {
					return {
						url: 'http://example.com/',
					}[key];
				},
			});

			result = result.replace(
				/<(\w+Date)>\w+, \d+ \w+ 20\d\d \d\d:\d\d:\d\d GMT<\/(?:\w+Date)>/g,
				'<$1>Sun, 1 Apr 2016 11:12:13 GMT</$1>'
			);
			expect(result).to.eql(readFile('test/expected/feed.xml'));
		});
	});
});
