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
  let protocol, host, path;

  if (!(_.startsWith(elastic, 'http://') || _.startsWith(elastic, 'https://'))) {
    elastic = 'http://' + elastic;
  }
  ({protocol, host, path} = urlUtil.parse(elastic));
  return {
    host: (protocol ? protocol + '//' : '') + host,
    index: path.split('/').pop()
  };
}

function scrollStream(client, options) {
  let first = true, streamed = 0, scrollId, total;

  _.defaults(options, {
    scroll: DEFAULT_SCROLL_WINDOW,
    size: DEFAULT_SCROLL_SIZE
  });

  return h(function (push, next) {
    if (first) {
      client.search(options).then((response) => {
        response.hits.hits.forEach(hit => {
          push(null, hit);
          streamed++;
        });
        scrollId = response._scroll_id;
        first = false;
        total = response.hits.total;
        next();
      });
    } else if (total > streamed) {
      client.scroll({
        scrollId,
        scroll: options.scroll
      }).then((response) => {
        response.hits.hits.forEach(hit => {
          push(null, hit);
          streamed ++;
        });
        scrollId = response._scroll_id;
        next();
      });
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
