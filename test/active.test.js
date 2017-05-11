'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const itemFixture = require('./fixtures/fastft.json');
const metricsMock = require('./utils/metrics-mock');
const sinon = require('sinon')

const active = proxyquire('../lib/active', {
	'./dynamos': {
		init: sinon.stub(),
		get: function (name) {
			return this[name];
		},
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, itemFixture), 300)
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, itemFixture), 100)
				}
			}
		}
	}
});

describe('#active', () => {

	before(() => active.init({ metrics: metricsMock }));

	it('should start off being ‘master’', () => {
		expect(active()).to.eql('master');
	});

	it('should prefer the faster region after the healthcheck has run', done => {
		setTimeout(() => {
			expect(active()).to.eql('slave');
			expect(active.totalFailure()).to.be.false;
			done();
		}, 500);
	});

});
