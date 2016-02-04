'use strict';

const get = require('./lib/get');
const dynamos = require('./lib/dynamos');
const logger = require('ft-next-logger').logger;

let dynamoInUse = 'master';

exports.get = fromURL => {
	const dynamo = dynamos[dynamoInUse];
	return get(dynamo.instance, dynamo.table, fromURL);
};

exports.active = () => {
	return dynamoInUse;
};


function raceDynamos() {
	return Promise.race([
		get(dynamos.master.instance, dynamos.master.table, 'www.ft.com/fastft').then(() => 'master', () => {}),
		get(dynamos.slave.instance, dynamos.slave.table, 'www.ft.com/fastft').then(() => 'slave', () => {})
	])
		.then(fasterDynamo => {
			dynamoInUse = fasterDynamo || 'master';
			logger.info({ event: 'RACE_DYNAMOS_WINNER', winner: fasterDynamo, willuse: dynamoInUse });
		});

}

setInterval(raceDynamos, 2*60*1000);
raceDynamos();
