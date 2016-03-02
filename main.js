'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const health = require('./lib/health');
const cache = require('./lib/cache');
const timeout = require('./lib/timeout');

let metrics;
let useCache = false;

exports.health = health.check;

exports.get = (fromURL, opts) => {
	opts = opts || {};
	if(useCache){
		let cacheItem = cache.retrieve(fromURL);
		if(cacheItem){
			return Promise.resolve(cacheItem);
		}
	}

	const dynamo = dynamos[active()];
	return timeout(() => {
		return get({
			dynamo: dynamo.instance,
			table: dynamo.table,
			fromURL,
			metrics
		}).then(result => {
			useCache && cache.store(fromURL, result);
			return result;
		});
	}, opts.timeout);
};

exports.init = opts => {
	metrics = opts.metrics;
	useCache = opts.useCache || false;
	cache.init({ metrics });
	active.init({ metrics });
};
