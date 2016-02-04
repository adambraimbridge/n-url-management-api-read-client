'use strict';

const AWS = require('aws-sdk');

module.exports = {
	master: {
		table: 'urlmgmtapi_master',
		instance: new AWS.Dynamo({
			region: 'eu-west-1',
			accessKeyId: URLMGMTAPI_AWS_ACCESS_KEY,
			secretAccessKey: URLMGMTAPI_AWS_SECRET_KEY
		})
	},
	slave: {
		table: 'urlmgmtapi_slave',
		instance: new AWS.Dynamo({
			region: 'us-east-1',
			accessKeyId: URLMGMTAPI_AWS_ACCESS_KEY,
			secretAccessKey: URLMGMTAPI_AWS_SECRET_KEY
		})
	}
};
