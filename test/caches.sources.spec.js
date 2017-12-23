import {
	isSourceUpdated,
	setSourceCache,
	updateSourceCache,
	getSourceFromCache,
} from '../src/caches/sources';

afterEach(() => {
	setSourceCache();
});

const file = 'test/samples/markdown-with-frontmatter.md';

describe('source cache', () => {
	test('return true for new pages', () => {
		const result = isSourceUpdated(file);
		expect(result).toBe(true);
	});

	test('return true for updated pages', () => {
		setSourceCache({
			[file]: {
				date: new Date(1980, 1, 1).getTime(),
			},
		});
		const result = isSourceUpdated(file);
		expect(result).toBe(true);
	});

	test('return false for not updated pages', () => {
		setSourceCache({
			[file]: {
				date: Date.now(),
			},
		});
		const result = isSourceUpdated(file);
		expect(result).toBe(false);
	});

	test('create hash in cache', () => {
		setSourceCache({
			[file]: {},
		});
		const data = { foo: 42 };
		updateSourceCache(file, data);
		expect(getSourceFromCache(file)).toEqual(data);
	});
});
