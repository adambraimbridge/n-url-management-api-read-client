'use strict';

const AWS = require('aws-sdk');
const https = require('https');
function dynamo (table, region, opts) {
	const httpOptions = {};
	if (opts.timeout) {
		httpOptions.timeout = opts.timeout
	}
	if (opts.poolConnections === true) {
		httpOptions.agent = new https.Agent({ keepAlive: true})
	}
	if (opts.connectTimeout) {
		httpOptions.connectTimeout = opts.connectTimeout
	}

	return {
		table,
		instance: new AWS.DynamoDB({
			region: region,
			accessKeyId: process.env.URLMGMTAPI_AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY,
			secretAccessKey: process.env.URLMGMTAPI_AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
			httpOptions
		})
	};
}
const dynamos = {};

module.exports.init = function (opts) {
	dynamos.master = dynamo('urlmgmtapi_master', 'eu-west-1', opts);
	dynamos.slave = dynamo('urlmgmtapi_slave', 'us-east-1', opts)
}

module.exports.get = name => dynamos[name];
