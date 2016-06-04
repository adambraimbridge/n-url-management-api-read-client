'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const itemFixture = require('./fixtures/fastft.json');
const metricsMock = require('./utils/metrics-mock');

const mockInstance = {
	getItem: (opts, cb) => {
		if (opts.Key.FromURL.S === 'https://www.ft.com/fastft') {
			setTimeout(() => cb(null, itemFixture))
		} else if (opts.Key.FromURL.S === 'https://www.ft.com/slowft') {
			setTimeout(() => cb(null, itemFixture), 1000)
		} else {
			setTimeout(() => cb(null, {}));
		}
	}
};

const main = proxyquire('..', {
	'./lib/dynamos': {
		master: { table: 'urlmgmtapi_master', instance: mockInstance },
		slave: { table: 'urlmgmtapi_slave', instance: mockInstance }
	}
});

describe('#get', () => {

	before(() => main.init({ metrics: metricsMock, timeout: 500 }));

	it('should #get /fastft', () => {
		return main.get('https://www.ft.com/fastft')
			.then(data => {
				expect(data).to.eql({
					code: 100,
					fromURL: 'https://www.ft.com/fastft',
					toURL: 'https://www.ft.com/stream/brandId/NTlhNzEyMzMtZjBjZi00Y2U1LTg0ODUtZWVjNmEyYmU1NzQ2-QnJhbmRz'
				});
			});
	});

	it('should return a vanity-like response if the database doesn\'t contain a url', () => {
		return main.get('https://www.ft.com/unknown')
			.then(data => {
				expect(data).to.eql({
					code: 100,
					fromURL: 'https://www.ft.com/unknown',
					toURL: 'https://www.ft.com/unknown'
				});
			});
	});

	it('should reject if the vanity service takes too long', () => {
		return main.get('https://www.ft.com/slowft')
			.then(() => {
				throw new Error('getting a slow vanity should not resolve');
			}, error => {
				expect(error.toString()).to.contain('timed out')
			});
	});

	it('should redirect urls with trailing slashes to the slash-less url', () => {
		return main.get('https://www.ft.com/fastft/')
			.then(data => {
				expect(data).to.eql({
					code: 301,
					fromURL: 'https://www.ft.com/fastft/',
					toURL: 'https://www.ft.com/fastft'
				});
			});
	});

	it('shouldn\'t redirect urls with trailing slashes to the slash-less url if that URL is only a /', () => {
		return main.get('https://www.ft.com/')
			.then(data => {
				expect(data).to.eql({
					code: 100,
					fromURL: 'https://www.ft.com/',
					toURL: 'https://www.ft.com/'
				});
			});
	});
});
