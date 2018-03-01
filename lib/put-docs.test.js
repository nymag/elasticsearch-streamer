'use strict';

const fn = require('./put-docs'),
  sinon = require('sinon'),
  expect = require('chai').expect,
  util = require('./util'),
  h = require('highland'),
  _ = require('lodash'),
  {DEFAULT_TYPE, DEFAULT_BATCH_SIZE} = require('./constants');

describe('get-docs', function () {
  let sandbox,
    esClientStub,
    mockDocs,
    bulkStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    esClientStub = sinon.stub();
    bulkStub = sinon.stub();
    esClientStub.bulk = bulkStub;
    mockDocs = [{
      _id: 'doc1',
      _index: 'index1',
      a: 'b'
    }, {
      _id: 'doc2',
      _index: 'index1',
      c: 'd'
    }];
    sandbox.stub(util, 'getEsClient');
    util.getEsClient.returns(esClientStub);
    bulkStub.returns([{items: [1,2,3]}]);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it ('sends bulk request to create items from source stream', function (done) {
    fn(h(mockDocs), 'http://foo.com').toArray(() => {
      expect(bulkStub.getCall(0).args[0]).to.eql({
        body: [{
          create: {
            _index: 'index1',
            _type: DEFAULT_TYPE,
            _id: 'doc1'
          }
        }, {
          a: 'b'
        }, {
          create: {
            _index: 'index1',
            _type: DEFAULT_TYPE,
            _id: 'doc2'
          }
        }, {
          c: 'd'
        }]
      });
      done();
    });
  });

  it ('streams individual bulk response items', function (done) {
    fn(h(mockDocs), 'http://foo.com').toArray(results => {
      expect(results).to.eql([1,2,3]);
      done();
    });
  });

  it ('groups docs in batches of default size if "batch" option is not specified', function (done) {
    mockDocs = _.range(DEFAULT_BATCH_SIZE * 2).map(i => ({
      _id: `doc${i}`,
      _index: 'index1',
      a: 'b'
    }));
    fn(h(mockDocs), 'http://foo.com').toArray(() => {
      expect(bulkStub.getCalls().length).to.equal(2);
      done();
    });
  });

  it ('groups docs in batches of size specified by "batch" option', function (done) {
    mockDocs = _.range(10).map(i => ({
      _id: `doc${i}`,
      _index: 'index1',
      a: 'b'
    }));
    fn(h(mockDocs), 'http://foo.com', {batch: 2}).toArray(() => {
      expect(bulkStub.getCalls().length).to.equal(5);
      done();
    });
  });

  it ('if elastic endpoint includes index, sets _index of each bulk item', function (done) {
    fn(h(mockDocs), 'http://foo.com/bar').toArray(() => {
      const bulkOps = bulkStub.getCall(0).args[0].body;

      expect(bulkOps[0].create._index).to.equal('bar');
      expect(bulkOps[2].create._index).to.equal('bar');
      done();
    });
  });
});
