'use strict';

const active = require('./active');

module.exports = opts => {
	return {
		getStatus: () => {
			return {
				name: 'n-url-management-api-read-client can communicate with DynamoDB',
				ok: !active.totalFailure,
				checkOutput: `Total failure mode (can't reach either master or slave DynamoDBs) when the following is true: ${active.totalFailure}.  Currently using: ${active()}`,
				lastUpdated: new Date(),
				panicGuide: `Try checking the \`URLMGMTAPI_AWS_ACCESS/SECRET_KEY\`s and the status of DynamoDB in both eu-west-1 and us-east-1`,
				severity: opts.severity,
				businessImpact: `Lots of URLs will not work, the site will be very broken.`,
				technicalSummary: `This app can't talk to either DynamoDB tables.`
			}
		}
	};
};
