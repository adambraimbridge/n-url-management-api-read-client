'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');

exports.get = fromURL => {
	const dynamo = dynamos[active()];
	return get(dynamo.instance, dynamo.table, fromURL);
};
