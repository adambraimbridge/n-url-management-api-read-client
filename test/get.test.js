'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;
const mockItem = require('./fixtures/fastft.json');

const mockInstance = {
	getItem: (opts, cb) => {
		setTimeout(() => cb(null, mockItem))
	}
};

const main = proxyquire('..', {
	'./lib/dynamos': {
		master: { table: 'urlmgmtapi_master', instance: mockInstance },
		slave: { table: 'urlmgmtapi_slave', instance: mockInstance }
	}
});

describe('#get', () => {

	it('should #get /fastft', () => {
		return main.get('www.ft.com/fastft')
			.then(data => {
				expect(data).to.eql({
					code: 100,
					fromURL: 'www.ft.com/fastft',
					toURL: 'www.ft.com/stream/brandId/NTlhNzEyMzMtZjBjZi00Y2U1LTg0ODUtZWVjNmEyYmU1NzQ2-QnJhbmRz'
				});
			});
	});

});
