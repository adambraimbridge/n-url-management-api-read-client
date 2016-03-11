'use strict';

const denodeify = require('denodeify');
const timeoutPromise = require('./timeout');

function decode (dynamoObject) {
	return {
		fromURL: dynamoObject.FromURL.S,
		toURL: dynamoObject.ToURL.S,
		code: parseInt(dynamoObject.Code.N, 10)
	};
}

module.exports = opts => {
	const dynamo = opts.dynamo;
	const table = opts.table;
	// HACK: next.ft.com *will* be FT.com, so hack it so that n-url-management-api treats them the same, for now…
	const fromURL = opts.fromURL.replace(/^next\.ft\.com/, 'www.ft.com');
	const metrics = opts.metrics;
	const timeout = opts.timeout;
	const start = new Date();

	metrics.count(`${table}_requests`);
	return timeoutPromise(() => {
		return denodeify(dynamo.getItem.bind(dynamo))({
				TableName: table,
				Key: {
					FromURL: {
						S: fromURL
					}
				}
			})
			.then(data => {
				metrics.histogram(`${table}_response_time`, new Date() - start);
				if (data.Item) {
					metrics.count(`${table}_status_2xx`);
					return decode(data.Item);
				}
				metrics.count(`${table}_status_4xx`);
				return {
					fromURL,
					toURL: fromURL,
					code: 100
				};
			}, err => {
				metrics.count(`${table}_status_5xx`);
				return Promise.reject(err);
			});
	}, timeout)
		.catch(error => {
			if (error.toString().indexOf('timed out') > -1) {
				metrics.count(`${table}_status_timeout`);
			}
			throw error;
		});
};
