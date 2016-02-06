'use strict';

const logger = require('ft-next-logger').logger;

exports.count = metric => {
	logger.info({ event: 'METRICS_COUNT', metric });
};
exports.histogram = (metric, value) => {
	logger.info({ event: 'METRICS_HISTOGRAM', metric, value });
};
