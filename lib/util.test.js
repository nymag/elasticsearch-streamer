'use strict';

const lib = require('./util'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  { DEFAULT_SCROLL_WINDOW, DEFAULT_SCROLL_SIZE } = require('./constants');

describe('parseElastic', function () {
  const fn = lib[this.title];

  it ('parses index and host from input', function () {
    expect(fn('http://localhost:9200/test')).to.eql({
      host: 'http://localhost:9200',
      index: 'test'
    });
  });

  it ('parses host if input has no index', function () {
    expect(fn('http://localhost:9200')).to.eql({
      host: 'http://localhost:9200',
      index: ''
    });
  });

  it ('assumes http if protocol is unspecified', function () {
    expect(fn('localhost:9200/test')).to.eql({
      host: 'http://localhost:9200',
      index: 'test'
    });
  });

  it ('parses https host', function () {
    expect(fn('https://localhost:9200/test')).to.eql({
      host: 'https://localhost:9200',
      index: 'test'
    });
  });

  it ('parses host with no port', function () {
    expect(fn('https://localhost/test')).to.eql({
      host: 'https://localhost',
      index: 'test'
    });
  });

  it ('parses host with trailing slash', function () {
    expect(fn('http://localhost:9200/')).to.eql({
      host: 'http://localhost:9200',
      index: ''
    });
  });

  it ('parses index with trailing slash', function () {
    expect(fn('http://localhost:9200/test/')).to.eql({
      host: 'http://localhost:9200',
      index: 'test'
    });
  });

});

describe('scrollStream', function () {
  const fn = lib[this.title];
  let client;

  beforeEach(function () {
    client = {
      search: sinon.stub(),
      scroll: sinon.stub()
    };
    client.search.resolves({
      hits: {hits: [0,1,2], total: 8},
      _scroll_id: 'a',
    });
    client.scroll.onCall(0).resolves({
      hits: {hits: [3,4,5], total: 8},
      _scroll_id: 'b'
    });
    client.scroll.onCall(1).resolves({
      hits: {hits: [6,7], total: 8},
      _scroll_id: 'c'
    });
  });

  it ('correctly scrolls Elastic', function () {
    return fn(client)
      .collect()
      .toPromise(Promise)
      .then(results => {
        expect(results).to.eql(_.range(8));
        expect(client.search.calledOnce).to.be.true;
        expect(client.scroll.calledTwice).to.be.true;
        expect(client.search.getCall(0).args[0]).to.eql({
          scroll: DEFAULT_SCROLL_WINDOW,
          size: DEFAULT_SCROLL_SIZE
        });
        expect(client.scroll.getCall(0).args[0]).to.eql({
          scrollId: 'a',
          scroll: DEFAULT_SCROLL_WINDOW,
        });
        expect(client.scroll.getCall(1).args[0]).to.eql({
          scrollId: 'b',
          scroll: DEFAULT_SCROLL_WINDOW,
        });
      });
  });

  it ('overwrites default options with specified options', function () {
    const opts = {
      scroll: '20s',
      body: {query: {term: {foo: 'bar'}}}
    };

    return fn(client, opts)
      .collect()
      .toPromise(Promise)
      .then(() => {
        expect(client.search.getCall(0).args[0]).to.eql({
          scroll: '20s',
          body: {query: {term: {foo: 'bar'}}},
          size: DEFAULT_SCROLL_SIZE
        });
        expect(client.scroll.getCall(0).args[0].scroll).to.equal('20s');
      });
  });
});
