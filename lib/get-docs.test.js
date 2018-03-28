'use strict';

const fn = require('./get-docs'),
  sinon = require('sinon'),
  expect = require('chai').expect,
  util = require('./util'),
  h = require('highland');

describe('get-docs', function () {
  const mockDocs = [{a:'1',b:'2',c:'3'}];
  let sandbox,
    esClientStub;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.stub(util, 'scrollStream');
    sandbox.stub(util, 'getEsClient');
    esClientStub = sinon.stub();
    util.scrollStream.returns(h(mockDocs));
    util.getEsClient.returns(esClientStub);
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('connects to host inferred from specified elastic endpoint', function (done) {
    return fn('http://foo.com/bar').done(() => {
      expect(util.getEsClient.getCall(0).args[0].host).to.equal('http://foo.com');
      done();
    });
  });

  it('assumes elastic endpoint is http if protocol is not specified', function (done) {
    return fn('foo.com/bar').done(() => {
      expect(util.getEsClient.getCall(0).args[0].host).to.equal('http://foo.com');
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

  it ('calls scrollStream with search option if "search" option is specified', function (done) {
    return fn('foo.com/bar', {search: {body: {a:'b'}}}).done(() => {
      expect(util.scrollStream.getCall(0).args[1].body).to.eql({a:'b'});
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
