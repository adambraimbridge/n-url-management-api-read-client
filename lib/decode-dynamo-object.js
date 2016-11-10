'use strict';

module.exports = dynamoObject => {
	return {
		fromURL: encodeURI(dynamoObject.FromURL.S),
		toURL: encodeURI(dynamoObject.ToURL.S),
		code: parseInt(dynamoObject.Code.N, 10)
	};
};
