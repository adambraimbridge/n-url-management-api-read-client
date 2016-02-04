'use strict';

const AWS = require('aws-sdk');

module.exports = {
	master: {
		table: 'urlmgmtapi_master',
		instance: new AWS.DynamoDB({
			region: 'eu-west-1',
			accessKeyId: process.env.URLMGMTAPI_AWS_ACCESS_KEY,
			secretAccessKey: process.env.URLMGMTAPI_AWS_SECRET_KEY
		})
	},
	slave: {
		table: 'urlmgmtapi_slave',
		instance: new AWS.DynamoDB({
			region: 'us-east-1',
			accessKeyId: process.env.URLMGMTAPI_AWS_ACCESS_KEY,
			secretAccessKey: process.env.URLMGMTAPI_AWS_SECRET_KEY
		})
	}
};
