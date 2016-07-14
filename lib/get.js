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
	const fromURL = opts.fromURL;
	const metrics = opts.metrics;
	const timeout = opts.timeout;
	const start = process.hrtime();

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
				metrics.histogram(`${table}_response_time`, calculateResponseTime(start));
				if (data.Item) {
					metrics.count(`${table}_status_2xx`);
					return decode(data.Item);
				}
				metrics.count(`${table}_status_4xx`);
				throw new Error('URL_NOT_FOUND');
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
