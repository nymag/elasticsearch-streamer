'use strict';

const util = require('../lib/util'),
  {
    DEFAULT_SCROLL_WINDOW,
    DEFAULT_SCROLL_SIZE
  } = require('./constants');

function getDocs(elastic, {parse = true, query} = {}) {
  const {host, index} = util.parseElastic(elastic),
    client = util.getEsClient({host}),
    opts = {
      index,
      scroll: DEFAULT_SCROLL_WINDOW,
      size: DEFAULT_SCROLL_SIZE
    };

  if (query) opts.body = {query};

  return util.scrollStream(client, opts, ['_id'])
    .invoke('toString')
    .map(i => parse ? JSON.parse(i) : i);
}

module.exports = getDocs;
