'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const batchGet = require('./lib/batch-get');
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
	});
};

exports.batchGet = fromURLs => {
	// TODO: This should probably be more generic and actually parse the URL to extract the path to
	//check that it isn't just `/` rather than being specifically for FT.com
//	if (fromURL !== 'https://www.ft.com/' && fromURL[fromURL.length - 1] === '/') {
//		const trimmedURL = fromURL.replace(/\/+$/, '');
//		return Promise.resolve({
//			fromURL,
//			toURL: trimmedURL,
//			code: 301
//		});
//	}

	const dynamo = dynamos[active()];
	return batchGet({
		dynamo: dynamo.instance,
		table: dynamo.table,
		fromURLs,
		metrics,
		timeout
	});
};

exports.init = opts => {
	metrics = opts.metrics;
	timeout = opts.timeout;
	active.init({ metrics });
};
