'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const health = require('./lib/health');
const cache = require('./lib/cache');

let metrics;
let useCache = false;
let timeout;

exports.health = health.check;

exports.get = fromURL => {
	if(useCache){
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
		metrics,
		timeout
	}).then(result => {
		useCache && cache.store(fromURL, result);
		return result;
	});
};

exports.init = opts => {
	metrics = opts.metrics;
	useCache = opts.useCache || false;
	timeout = opts.timeout;
	cache.init({ metrics });
	active.init({ metrics });
};
