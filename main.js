'use strict';

const get = require('./lib/get');
const dynamos = require('./lib/dynamos');

let dynamoInUse = 'master';

exports.get = fromURL => {
	const dynamo = dynamos[dynamoInUse];
	return get(dynamo.instance, dynamo.table, fromURL);
};
