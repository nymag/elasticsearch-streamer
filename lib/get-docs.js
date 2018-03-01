'use strict';

const util = require('../lib/util'),
  {
    DEFAULT_SCROLL_WINDOW,
    DEFAULT_SCROLL_SIZE
  } = require('./constants');

/**
 * Get Elastic documents from the specified Elastic endpoint.
 * @param  {string}  elastic e.g. localhost:9200/foo
 * @param  {Object}  [options]
 * @param  {Boolean} [options.parse=true] Set to "false" to keep docs as JSON
 * @param  {Object}  [options.query] Specify query to filter docs
 * @return {Stream} of objects or JSON strings
 */
function getDocs(elastic, {parse = true, query} = {}) {
  const {host, index} = util.parseElastic(elastic),
    client = util.getEsClient({host}),
    opts = {
      index,
      scroll: DEFAULT_SCROLL_WINDOW,
      size: DEFAULT_SCROLL_SIZE
    };

  if (query) opts.body = {query};

  return util.scrollStream(client, opts, ['_id', '_index'])
    .invoke('toString')
    .map(i => parse ? JSON.parse(i) : i);
}

module.exports = getDocs;
