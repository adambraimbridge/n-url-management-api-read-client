'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const itemFixture = require('./fixtures/fastft.json');
const metricsMock = require('./utils/metrics-mock');

const active = proxyquire('../lib/active', {
	'./dynamos': {
		init: () => null,
		get: function (name) {
			return this[name];
		},
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(new Error('master failure')), 100);
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, itemFixture), 300);
				}
			}
		}
	}
});

describe('#active in a single region failure mode', () => {

	before(() => active.init({ metrics: metricsMock }));

	it('should start off being ‘master’', () => {
		expect(active()).to.eql('master');
	});

	it('should use the healthy region', done => {
		setTimeout(() => {
			expect(active()).to.eql('slave');
			expect(active.totalFailure()).to.be.false;
			done();
		}, 500);
	});
});
