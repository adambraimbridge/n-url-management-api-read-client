'use strict';

module.exports = function (promiser, limit) {
	if (!limit) {
		return promiser();
	}
	return new Promise((resolve, reject) => {
		let timedOut = false;
		let timer = setTimeout(() => {
			timedOut = true;
			reject(new Error('Promise timed out'));
		}, limit);

		promiser()
			.then(result => {
				if (!timedOut) {
					resolve(result);
					clearTimeout(timer);
				}
			}, error => {
				if (!timedOut) {
					reject(error);
					clearTimeout(timer);
				}
			});
	});
};
