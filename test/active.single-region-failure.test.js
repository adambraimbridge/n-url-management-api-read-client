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

const active = proxyquire('../lib/active', {
	'./dynamos': {
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(new Error("master failure")), 100)
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, mockItem), 300)
				}
			}
		}
	}
});

describe('#active in a single region failure mode', () => {

	before(() => active.reset())

	it('should start off being ‘master’', () => {
		expect(active()).to.eql('master');
	});

	it('should use the healthy region', done => {
		setTimeout(() => {
			expect(active()).to.eql('slave');
			expect(active.totalFailure).to.be.false;
			done();
		}, 500);
	});

});
