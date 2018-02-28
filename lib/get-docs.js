'use strict';

const ScrollStream = require('elasticsearch-scroll-stream'),
  h = require('highland'),
  elasticsearch = require('elasticsearch'),
  util = require('../lib/util');

function getDocs(elastic, {parse = true, query}) {
  const {host, index} = util.parseElastic(elastic),
    client = new elasticsearch.Client({host}),
    opts = {index, scroll: '10s', size: '50'};

  if (query) opts.body = {query};

  return es = h(new ScrollStream(client, opts, ['_id']))
    .invoke('toString')
    .map(i => parse ? JSON.parse(i) : i);
}

module.exports = getDocs;
