'use strict';

const h = require('highland'),
  elasticsearch = require('elasticsearch'),
  _ = require('lodash'),
  urlUtil = require('url'),
  {
    DEFAULT_SCROLL_WINDOW,
    DEFAULT_SCROLL_SIZE
  } = require('./constants');


/**
* Read from stdin
* @return {Stream} of stdin lines
**/
function readStdin() {
  if (process.stdin.isTTY) {
    return h([]);
  } else {
    return h(process.stdin)
      .split('\n')
      .filter(i => i)
      .invoke('toString');
  }
}

/**
 * Parse elastic endpoint.
 * @param  {string} elastic e.g. localhost:9200/foo
 * @return {Object} of form {index: string, host: string}
 */
function parseElastic(elastic) {
  let protocol, host, path, splitPath, index = '';

  if (!(_.startsWith(elastic, 'http://') || _.startsWith(elastic, 'https://'))) {
    elastic = 'http://' + elastic;
  }
  ({protocol, host, path} = urlUtil.parse(elastic));

  host = `${protocol ? protocol + '//' : ''}${host}`;
  path = _.endsWith(path, '/') ? path.slice(0, -1) : path;

  if (path) {
    splitPath = path.split('/');
    index = splitPath.pop();
  }

  return {host, index};
}

/**
 * Streams documents from an Elasticsearch client via the scroll API.
 * @param  {Object} client Elasticsearch client
 * @param  {Object} [searchOpts]
 * @return {Stream} Highland stream
 */
function scrollStream(client, searchOpts = {}) {
  let first = true, streamed = 0, scrollId, total;

  _.defaults(searchOpts, {
    scroll: DEFAULT_SCROLL_WINDOW,
    size: DEFAULT_SCROLL_SIZE
  });

  return h(function (push, next) {
    if (first) {
      client.search(searchOpts)
        .then((response) => {
          response.hits.hits.forEach(hit => {
            push(null, hit);
            streamed++;
          });
          scrollId = response._scroll_id;
          first = false;
          total = response.hits.total;
          next();
        })
        .catch(err => push(err, h.nil));
    } else if (total > streamed) {
      client.scroll({
        scrollId,
        scroll: searchOpts.scroll
      })
        .then((response) => {
          response.hits.hits.forEach(hit => {
            push(null, hit);
            streamed ++;
          });
          scrollId = response._scroll_id;
          next();
        })
        .catch(err => push(err, h.nil));
    } else {
      push(null, h.nil);
    }
  });
}

function getEsClient() {
  return new elasticsearch.Client(...arguments);
}

module.exports.getEsClient = getEsClient;
module.exports.readStdin = readStdin;
module.exports.parseElastic = parseElastic;
module.exports.scrollStream = scrollStream;
