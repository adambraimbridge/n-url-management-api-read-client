'use strict';

const denodeify = require('denodeify');

function decode(dynamoObject) {
	return {
		fromURL: dynamoObject.FromURL.S,
		toURL: dynamoObject.ToURL.S,
		code: parseInt(dynamoObject.Code.N, 10)
	};
}

module.exports = opts => {
	const dynamo = opts.dynamo;
	const table = opts.table;
	const fromURL = opts.fromURL;
	const metrics = opts.metrics;
	const start = new Date();

	metrics.count(`${table}_requests`);
	return denodeify(dynamo.getItem.bind(dynamo))({
			TableName: table,
			Key: {
				FromURL: {
					 S: fromURL
				}
			}
		})
		.then(function(data) {
			metrics.histogram(`${table}_response_time`, new Date() - start);
			if (data.Item) {
				metrics.count(`${table}_status_2xx`);
				return decode(data.Item);
			}
			metrics.count(`${table}_status_4xx`);
			throw new Error('URL not found');
		}, function(err) {
			metrics.count(`${table}_status_5xx`);
			return Promise.reject(err);
		});
};
