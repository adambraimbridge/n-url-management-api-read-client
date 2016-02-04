'use strict';

const denodeify = require('denodeify');

function decode(dynamoObject) {
	return {
		fromURL: dynamoObject.FromURL.S,
		toURL: dynamoObject.ToURL.S,
		code: parseInt(dynamoObject.Code.N, 10)
	};
}

module.exports = (dynamo, table, fromURL) => {
	return denodeify(dynamo.getItem.bind(dynamo))({
			TableName: table,
			Key: {
				FromURL: {
					 S: fromURL
				}
			}
		})
		.then(function(data) {
			if (data.Item) {
				return decode(data.Item);
			}
			throw new Error('URL not found');
		});
};
