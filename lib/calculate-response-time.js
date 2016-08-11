'use strict';

module.exports = start => {
	let time = process.hrtime(start);
	return (time[0] * 1000) + Math.round(time[1] / 1e6);
};
