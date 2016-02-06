'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const health = require('./lib/health');

let metrics;

exports.health = health.check;

exports.get = fromURL => {
	const dynamo = dynamos[active()];
	return get({
		dynamo: dynamo.instance,
		table: dynamo.table,
		fromURL,
		metrics
	});
};

exports.init = opts => {
	metrics = opts.metrics;
	active.init({ metrics });
};
