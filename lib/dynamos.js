'use strict';

const AWS = require('aws-sdk');

function dynamo(table, region) {
	return {
		table,
		instance: new AWS.DynamoDB({
			region: region,
			accessKeyId: process.env.URLMGMTAPI_AWS_ACCESS_KEY,
			secretAccessKey: process.env.URLMGMTAPI_AWS_SECRET_KEY
		})
	};
}

module.exports = {
	master: dynamo('urlmgmtapi_master', 'eu-west-1'),
	slave: dynamo('urlmgmtapi_slave', 'us-east-1')
};
