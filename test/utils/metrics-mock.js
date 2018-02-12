'use strict';

const logger = require('@financial-times/n-logger').default;

exports.count = metric => {
	logger.info({ event: 'METRICS_COUNT', metric });
};
exports.histogram = (metric, value) => {
	logger.info({ event: 'METRICS_HISTOGRAM', metric, value });
};
