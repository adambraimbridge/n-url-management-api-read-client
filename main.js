'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const health = require('./lib/health');
const cache = require('./lib/cache');

let metrics;

exports.health = health.check;

exports.get = fromURL => {
	if(process.env.USE_CACHE){
		let cacheItem = cache.retrieve(fromURL);
		if(cacheItem){
			return Promise.resolve(cacheItem);
		}
	}

	const dynamo = dynamos[active()];
	return get({
		dynamo: dynamo.instance,
		table: dynamo.table,
		fromURL,
		metrics
	}).then(result => {
		process.env.USE_CACHE && cache.store(fromURL, result);
		return result;
	});
};

exports.init = opts => {
	metrics = opts.metrics;
	cache.init({ metrics });
	active.init({ metrics });
};
