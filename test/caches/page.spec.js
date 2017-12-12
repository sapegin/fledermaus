import hashSum from 'hash-sum';
import { isPageUpdated, getPageCache, setPageCache } from '../../src/caches/pages';

describe('page cache', () => {
	test('return true for new pages', () => {
		setPageCache({});
		const result = isPageUpdated('a.html', 'x');
		expect(result).toBe(true);
	});

	test('return true for updated pages', () => {
		setPageCache({ 'a.html': hashSum('y') });
		const result = isPageUpdated('a.html', 'x');
		expect(result).toBe(true);
	});

	test('return false for not updated pages', () => {
		setPageCache({ 'a.html': hashSum('x') });
		const result = isPageUpdated('a.html', 'x');
		expect(result).toBe(false);
	});

	test('return false for not updated pages', () => {
		setPageCache({ 'a.html': hashSum('x') });
		const result = isPageUpdated('a.html', 'x');
		expect(result).toBe(false);
	});

	test('create hash in cache', () => {
		setPageCache({});
		isPageUpdated('a.html', 'x');
		expect(getPageCache()).toEqual({ 'a.html': hashSum('x') });
	});

	test('update hash in cache', () => {
		setPageCache({ 'a.html': hashSum('x') });
		isPageUpdated('a.html', 'y');
		expect(getPageCache()).toEqual({ 'a.html': hashSum('y') });
	});
});
