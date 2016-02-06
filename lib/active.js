'use strict';

const dynamos = require('./dynamos');
const get = require('./get');
const logger = require('ft-next-logger').logger;
const surviver = require('./promise-surviver');

let dynamoInUse = 'master';
let totalFailure = false;
let metrics;

module.exports = () => dynamoInUse;
module.exports.init = init;
module.exports.totalFailure = () => totalFailure;

function raceDynamos() {
	return surviver([
		get({ dynamo: dynamos.master.instance, table: dynamos.master.table, fromURL: 'www.ft.com/fastft', metrics: metrics }).then(() => 'master'),
		get({ dynamo: dynamos.slave.instance, table: dynamos.slave.table, fromURL: 'www.ft.com/fastft', metrics: metrics }).then(() => 'slave')
	])
		.then(fasterDynamo => {
			dynamoInUse = fasterDynamo;
			logger.info({ event: 'RACE_DYNAMOS_WINNER', dynamoInUse: dynamoInUse });
			totalFailure = false;
		}, errs => {
			dynamoInUse = 'master';
			logger.warn({ event: 'RACE_DYNAMOS_NO_WINNERS', dynamoInUse: dynamoInUse });
			totalFailure = true;
		});

}

function init(opts) {
	metrics = opts.metrics;
	dynamoInUse = 'master';
	totalFailure = false;
	let checker = setInterval(raceDynamos, 2*60*1000);
	raceDynamos();
}
