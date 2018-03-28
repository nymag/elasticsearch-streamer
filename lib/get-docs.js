'use strict';

const util = require('../lib/util');

/**
 * Get Elastic documents from the specified Elastic endpoint.
 * @param  {string}  elastic e.g. localhost:9200/foo
 * @param  {Object}  [options]
 * @param  {Boolean} [options.parse=true] Set to "false" to keep docs as JSON
 * @param  {Object}  [options.search] Specify query to filter docs
 * @return {Stream} of objects or JSON strings
 */
function getDocs(elastic, {parse = true, search} = {}) {
  const {host, index} = util.parseElastic(elastic),
    client = util.getEsClient({host}),
    opts = Object.assign({index}, search);

  return util.scrollStream(client, opts)
    .map(i => parse ? i : JSON.stringify(i));
}

module.exports = getDocs;
