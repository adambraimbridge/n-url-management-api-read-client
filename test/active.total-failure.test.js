'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const metricsMock = require('./utils/metrics-mock');

const active = proxyquire('../lib/active', {
	'./dynamos': {
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(new Error('master failure')), 150)
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(new Error('slave failure')), 100)
				}
			}
		}
	}
});
const health = proxyquire('../lib/health', { './active': active });

describe('#active in a total failure mode', () => {

	before(() => active.init({ metrics: metricsMock }));

	it('should start off being ‘master’', () => {
		expect(active()).to.eql('master');
	});

	it('should just use master and hope for the best', done => {
		setTimeout(() => {
			expect(active()).to.eql('master');
			expect(active.totalFailure()).to.be.true;
			done();
		}, 200);
	});

	it('should fail the healthcheck', done => {
		setTimeout(() => {
			const check = health.check({ severity: 2 }).getStatus();
			expect(check.ok).to.be.false;
			expect(check.severity).to.eql(2);
			done();
		}, 200);
	});

});
