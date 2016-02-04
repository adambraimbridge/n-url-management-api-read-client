'use strict';

const dynamos = require('./dynamos');
const get = require('./get');
const logger = require('ft-next-logger').logger;
const surviver = require('./promise-surviver');

let dynamoInUse = 'master';
reset();

module.exports = () => dynamoInUse;
module.exports.reset = reset;

function raceDynamos() {
	return surviver([
		get(dynamos.master.instance, dynamos.master.table, 'www.ft.com/fastft').then(() => 'master'),
		get(dynamos.slave.instance, dynamos.slave.table, 'www.ft.com/fastft').then(() => 'slave')
	])
		.then(fasterDynamo => {
			dynamoInUse = fasterDynamo || 'master';
			logger.info({ event: 'RACE_DYNAMOS_WINNER', winner: fasterDynamo, willuse: dynamoInUse });
		}, err => {
			console.log(err.stack);
		});

}

function reset() {
	dynamoInUse = 'master';
	let checker = setInterval(raceDynamos, 2*60*1000);
	raceDynamos();
}
