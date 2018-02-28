'use strict';

const h = require('highland'),
  ScrollStream = require('elasticsearch-scroll-stream');

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

function parseElastic(elastic) {
  const split = elastic.split('/');

  return {
    index: split[split.length - 1],
    host: split.slice(0, split.length - 1).join('/')
  };
}

function scrollStream() {
  return h(new ScrollStream(...arguments));
}

function getEsClient() {
  return new elasticsearch.Client(...arguments);
}

module.exports.getEsClient = getEsClient;
module.exports.readStdin = readStdin;
module.exports.parseElastic = parseElastic;
module.exports.scrollStream = scrollStream;
