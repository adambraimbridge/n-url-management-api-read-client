'use strict';

const get = require('./lib/get');

// HACK: `let` rather than `const` so it can be rewired in tests 😞
let dynamos = require('./lib/dynamos');

let dynamoInUse = 'master';

exports.get = fromURL => {
	const dynamo = dynamos[dynamoInUse];
	return get(dynamo.instance, dynamo.table, fromURL);
};
