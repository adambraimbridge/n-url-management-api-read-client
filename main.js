'use strict';

const active = require('./lib/active');
const get = require('./lib/get');
const dynamos = require('./lib/dynamos');

exports.get = fromURL => {
	const dynamo = dynamos[active()];
	return get(dynamo.instance, dynamo.table, fromURL);
};

exports.health = opts => {
	return {
		getStatus: () => {
			return {
				name: 'n-url-management-api-read-client health check',
				ok: !active.totalFailure,
				checkOutput: `Total failure mode (can't reach either master or slave DynamoDBs) ${active.totalFailure}`,
				lastUpdated: new Date(),
				panicGuide: `Try checking the URLMGMTAPI_AWS_ACCESS/SECRET_KEYs and the status of DynamoDB in both eu-west-1 and us-east-1`,
				severity: opts.severity,
				businessImpact: `Lots of URLs will not work, the site will be very broken.`,
				technicalSummary: `This app can't talk to either DynamoDB tables.`
			}
		}
	};
};
