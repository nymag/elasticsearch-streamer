'use strict';

const fn = require('./get-docs'),
  sinon = require('sinon'),
  expect = require('chai').expect,
  util = require('./util'),
  h = require('highland'),
  {
    DEFAULT_SCROLL_WINDOW,
    DEFAULT_SCROLL_SIZE
  } = require('./constants');

describe('get-docs', function () {
  const mockDocs = [{a:'1',b:'2',c:'3'}];
  let sandbox,
    esClientStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(util, 'scrollStream');
    sandbox.stub(util, 'getEsClient');
    esClientStub = sinon.stub();
    util.scrollStream.returns(h(mockDocs.map(JSON.stringify).map(Buffer.from))),
    util.getEsClient.returns(esClientStub);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('connects to host inferred from specified elastic endpoint', function (done) {
    return fn('foo.com/bar').done(() => {
      expect(util.getEsClient.getCall(0).args[0].host).to.equal('foo.com');
      done();
    });
  });

  it('calls scrollStream with generated Elastic client', function (done) {
    return fn('foo.com/bar').done(() => {
      expect(util.scrollStream.getCall(0).args[0]).to.equal(esClientStub);
      done();
    });
  });

  it ('calls scrollStream with correctly parsed Elastic index', function (done) {
    return fn('foo.com/bar').done(() => {
      expect(util.scrollStream.getCall(0).args[1].index).to.equal('bar');
      done();
    });
  });

  it ('calls scrollStream with correct default "scroll" and "size" options', function (done) {
    return fn('foo.com/bar').done(() => {
      expect(util.scrollStream.getCall(0).args[1].size).to.equal(DEFAULT_SCROLL_SIZE);
      expect(util.scrollStream.getCall(0).args[1].scroll).to.equal(DEFAULT_SCROLL_WINDOW);
      done();
    });
  });

  it ('calls scrollStream with query if "query" option is specified', function (done) {
    return fn('foo.com/bar', {query: {a:'b'}}).done(() => {
      expect(util.scrollStream.getCall(0).args[1].body.query).to.eql({a:'b'});
      done();
    });
  });

  it ('parses docs by default', function (done) {
    return fn('foo.com/bar')
      .toArray((results) => {
        expect(results).to.eql(mockDocs);
        done();
      });
  });

  it ('leaves docs as stringified JSON if "parse" option is false', function (done) {
    return fn('foo.com/bar', {parse: false})
      .toArray((results) => {
        expect(results).to.eql(mockDocs.map(JSON.stringify));
        done();
      });
  });
});