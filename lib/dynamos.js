'use strict';

const AWS = require('aws-sdk');

module.exports = {
	master: {
		table: 'urlmgmtapi_master',
		instance: new AWS.Dynamo({ region: 'eu-west-1' })
	},
	slave: {
		table: 'urlmgmtapi_slave',
		instance: new AWS.Dynamo({ region: 'us-east-1' })
	}
};
