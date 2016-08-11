'use strict';

const denodeify = require('denodeify');
const timeoutPromise = require('./timeout');
const logger = require('ft-next-logger').logger;

function decode (dynamoObject) {
	return {
		fromURL: dynamoObject.FromURL.S,
		toURL: dynamoObject.ToURL.S,
		code: parseInt(dynamoObject.Code.N, 10)
	};
}

function calculateResponseTime(start){
	let time = process.hrtime(start);
	return (time[0] * 1000) + Math.round(time[1] / 1e6);
}

module.exports = opts => {
	const dynamo = opts.dynamo;
	const table = opts.table;
	const fromURLs = opts.fromURLs;
	const metrics = opts.metrics;
	const timeout = opts.timeout;
	const start = process.hrtime();

	metrics.count(`${table}_requests`);
	return timeoutPromise(() => {
		let query = { RequestItems: {} };
		query.RequestItems[table] = {
			Keys: fromURLs.map(fromURL => {
				return {
					FromURL: {
						S: fromURL
					}
				};
			})
		};
		return denodeify(dynamo.batchGetItem.bind(dynamo))(query)
			.then(data => {
				metrics.histogram(`${table}_response_time`, calculateResponseTime(start));
				return fromURLs.map(fromURL => {

					// Handle successes
					const success = data.Responses[table].find(response => response.FromURL.S === fromURL);
					if (success) {
						metrics.count(`${table}_status_2xx`);
						return decode(success);
					}

					// Handle failures
					metrics.count(`${table}_status_4xx`);
					return {
						fromURL,
						toURL: fromURL,
						code: 100
					};
				});
			}, err => {
				metrics.count(`${table}_status_5xx`);
				return Promise.reject(err);
			});
	}, timeout)
		.catch(error => {
			logger.info({ event: 'URL_MGMT_API_ERROR', error: error.toString() });
			if (error.toString().indexOf('timed out') > -1) {
				metrics.count(`${table}_status_timeout`);
			}
			throw error;
		});
};
