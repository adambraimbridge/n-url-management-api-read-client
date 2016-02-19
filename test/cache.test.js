'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

describe('Caching', function(){

	let cache;

	describe('Single Instance Caching', function(){

		let nodeCacheMockInstance;

		function NodeCacheMock(options){
			this.options = options;
			nodeCacheMockInstance = this;
			console.log('HERE', nodeCacheMockInstance);
		}

		before(function(){
			process.env.USE_CACHE = "SINGLE_INSTANCE";
			mockery.registerMock('node-cache', NodeCacheMock);
			mockery.enable({warnOnUnregistered:false, useCleanCache:true});
			cache = require('../lib/cache');
		});


		let metricsStub = {
			count: function(){},
			histogram: function(){}
		};

		NodeCacheMock.prototype.get = sinon.spy();
		NodeCacheMock.prototype.set = sinon.stub().callsArg(2);




		after(function(){
			mockery.deregisterAll();
			mockery.resetCache();
			mockery.disable();
			process.env.USE_CACHE = null;
		});

		it('Should setup the cache with a 30sec TTL', function(){
			cache.init({metrics:metricsStub});
			expect(nodeCacheMockInstance.options.stdTTL).to.equal(30);
			expect(nodeCacheMockInstance.options.checkperiod).to.equal(60);
		});

		it('Should be able to store a cache item', function(){
			let key = '/vanity-url';
			let value = '/real/url';
			cache.init({metrics:metricsStub});
			cache.store(key, value);
			sinon.assert.calledWith(nodeCacheMockInstance.set, key, value);
		});

		it('Should be able to retrieve a stored cache item', function(done){
			let key = '/vanity-url';
			let value = '/real/url';
			cache.init({metrics:metricsStub});
			return cache.store(key, value).then(function(){
				cache.retrieve(key);
				sinon.assert.calledWith(nodeCacheMockInstance.get, key);
				done();
			}).catch(function(err){
				done(err);
			});
		});
	});
});
