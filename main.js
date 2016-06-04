'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const health = require('./lib/health');

let metrics;
let timeout;

exports.health = health.check;

exports.get = fromURL => {
	// TODO: This should probably be more generic and actually parse the URL to extract the path to
	//check that it isn't just `/` rather than being specifically for FT.com
	if (fromURL !== 'https://www.ft.com/' && fromURL[fromURL.length - 1] === '/') {
		const trimmedURL = fromURL.replace(/\/+$/, '');
		return Promise.resolve({
			fromURL,
			toURL: trimmedURL,
			code: 301
		});
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
		return result;
	});
};

exports.init = opts => {
	metrics = opts.metrics;
	timeout = opts.timeout;
	active.init({ metrics });
};
