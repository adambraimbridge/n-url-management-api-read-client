'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const mockItem = require('./fixtures/fastft.json');

const active = proxyquire('../lib/active', {
	'./dynamos': {
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

	before(() => active.reset())

	it('should start off being ‘master’', () => {
		expect(active()).to.eql('master');
	});

	it('should prefer the faster region after the healthcheck has run', done => {
		setTimeout(() => {
			expect(active()).to.eql('slave');
			expect(active.totalFailure).to.be.false;
			done();
		}, 500);
	});

});
