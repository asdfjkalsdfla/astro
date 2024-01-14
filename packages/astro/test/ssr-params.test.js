import { expect } from 'chai';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';
import testAdapter from './test-adapter.js';

describe('Astro.params in SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/ssr-params/',
			adapter: testAdapter(),
			output: 'server',
			base: '/users/houston/',
		});
		await fixture.build();
	});

	it('Params are passed to component', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/food');
		const response = await app.render(request);
		expect(response.status).to.equal(200);
		const html = await response.text();
		const $ = cheerio.load(html);
		expect($('.category').text()).to.equal('food');
	});

	describe('Non-english characters in the URL', () => {
		it('Params are passed to component', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/users/houston/東西/food');
			const response = await app.render(request);
			expect(response.status).to.equal(200);
			const html = await response.text();
			const $ = cheerio.load(html);
			expect($('.category').text()).to.equal('food');
		});
	});

	describe('Encoded slash in the URL', () => {
		it('Encoded slashes are passed to param', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/users/houston/1%2F2food');
			const response = await app.render(request);
			expect(response.status).to.equal(200);
			const html = await response.text();
			const $ = cheerio.load(html);
			expect($('.category').text()).to.equal('1%2F2food');
		});
	});

	it('No double URL decoding', async () => {
		const app = await fixture.loadTestAdapterApp();
		const request = new Request('http://example.com/users/houston/%25');
		const response = await app.render(request);
		expect(response.status).to.equal(200);
		const html = await response.text();
		const $ = cheerio.load(html);
		expect($('.category').text()).to.equal('%');
	});
});
