'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

describe('Caching', function(){

	let cache;

	let nodeCacheMockInstance;

	function NodeCacheMock(options){
		this.options = options;
		nodeCacheMockInstance = this;
	}

	NodeCacheMock.prototype.get = sinon.spy();
	NodeCacheMock.prototype.set = sinon.stub().callsArg(2);


	before(function(){
		mockery.registerMock('node-cache', NodeCacheMock);
		mockery.enable({warnOnUnregistered:false});
		cache = require('../lib/cache');
	});

	after(function(){
		mockery.deregisterAll();
		mockery.disable();
	});

	describe('Single Instance Caching', function(){
		it('Should setup the cache with a 30sec TTL', function(){
			cache.init();
			expect(nodeCacheMockInstance.options.stdTTL).to.equal(30);
			expect(nodeCacheMockInstance.options.checkperiod).to.equal(60);
		});

		it('Should be able to store a cache item', function(){
			let key = '/vanity-url';
			let value = '/real/url';
			cache.init();
			cache.store(key, value);
			sinon.assert.calledWith(nodeCacheMockInstance.set, key, value);
		});

		it('Should be able to retrieve a stored cache item', function(done){
			let key = '/vanity-url';
			let value = '/real/url';
			cache.init();
			return cache.store(key, value).then(function(){
				let retrievedValue = cache.retrieve(key);
				sinon.assert.calledWith(nodeCacheMockInstance.get, key);
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});



});
