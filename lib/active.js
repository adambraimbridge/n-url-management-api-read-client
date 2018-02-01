'use strict';

const dynamos = require('./dynamos');
const get = require('./get');
const logger = require('ft-next-logger').logger;
const surviver = require('./promise-surviver');

const HEALTHCHECK_URL = 'https://www.ft.com/__$HEALTHCHECK';

let dynamoInUse = 'master';
let totalFailure = false;
let metrics;

module.exports = () => dynamoInUse;
module.exports.init = init;
module.exports.totalFailure = () => totalFailure;

function raceDynamos () {
	return surviver([
		get({ dynamo: dynamos.get('master').instance, table: dynamos.get('master').table, fromURL: HEALTHCHECK_URL, metrics: metrics }).then(() => 'master'),
		get({ dynamo: dynamos.get('slave').instance, table: dynamos.get('slave').table, fromURL: HEALTHCHECK_URL, metrics: metrics }).then(() => 'slave')
	])
		.then(fasterDynamo => {
			dynamoInUse = fasterDynamo;
			logger.info({ event: 'RACE_DYNAMOS_WINNER', dynamoInUse: dynamoInUse });
			totalFailure = false;
		}, () => {
			dynamoInUse = 'master';
			logger.warn({ event: 'RACE_DYNAMOS_NO_WINNERS', dynamoInUse: dynamoInUse });
			totalFailure = true;
		});

}

function init (opts) {
	dynamos.init(opts);
	metrics = opts.metrics;
	dynamoInUse = 'master';
	totalFailure = false;
	if (!opts.raceOnce) {
		setInterval(raceDynamos, 2*60*1000);
	}
	raceDynamos();
}
