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
	if (fromURL[fromURL.length - 1] === '/') {
		const trimmedURL = fromURL.replace(/\/+$/, '');
		return {
			fromURL,
			toURL: trimmedURL,
			code: 301
		};
	}

	const dynamo = dynamos[active()];
	return get({
		dynamo: dynamo.instance,
		table: dynamo.table,
		fromURL,
		metrics,
		timeout
	}).catch(err => {
		if (err.message === 'URL_NOT_FOUND') {
			// NB. This will still get cached by the next then because
			// now this promise is not rejected anymore.
			return {
				fromURL,
				toURL: fromURL,
				code: 100
			};
		}
		return Promise.reject(err);
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
