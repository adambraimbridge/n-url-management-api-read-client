'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const itemFixture = require('./fixtures/fastft.json');
const metricsMock = require('./utils/metrics-mock');
const sinon = require('sinon');
const dynamosInitStub = sinon.stub();

const active = proxyquire('../lib/active', {
	'./dynamos': {
		init: dynamosInitStub,
		get: function (name) {
			return this[name];
		},
		master: {
			table: 'urlmgmtapi_master',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, itemFixture), 300);
				}
			}
		},
		slave: {
			table: 'urlmgmtapi_slave',
			instance: {
				getItem: (opts, cb) => {
					setTimeout(() => cb(null, itemFixture), 100);
				}
			}
		}
	}
});

describe('#active', () => {
	const opts = { metrics: metricsMock };
	before(() => active.init(opts));

	it('should pass options to dynamos', () => {
		expect(dynamosInitStub.calledWith(opts)).to.be.true;
	});

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

	it('should set up a set interval', () => {
		sinon.stub(global, 'setInterval');
		active.init(opts);
		expect(setInterval.called).to.be.true;
		global.setInterval.restore();
	});

	it('should not run the set interval if raceOnce option is true', () => {
		sinon.stub(global, 'setInterval');
		const opts = { raceOnce: true, metrics: metricsMock };
		active.init(opts);
		expect(setInterval.called).to.be.false;
		global.setInterval.restore();
	});
});
