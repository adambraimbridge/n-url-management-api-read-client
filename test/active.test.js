'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;

const mockItem = {
	Item: {
		FromURL: { S: 'www.ft.com/fastft' },
		Code: { N: '100' },
		ToURL: { S: 'www.ft.com/stream/brandId/NTlhNzEyMzMtZjBjZi00Y2U1LTg0ODUtZWVjNmEyYmU1NzQ2-QnJhbmRz' }
	}
};

const main = proxyquire('..', {
	'./lib/dynamos': {
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, mockItem), 300)
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, mockItem), 100)
				}
			}
		}
	}
});

describe('#active', () => {

	it('should start off being ‘master’', () => {
		expect(main.active()).to.eql('master');
	});

	it('should prefer the faster region after the healthcheck has run', done => {
		setTimeout(() => {
			expect(main.active()).to.eql('slave');
			done();
		}, 500);
	});

});

