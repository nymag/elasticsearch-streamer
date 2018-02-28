'use strict';

const pino = require('pino')(), 
  h = require('highland');

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

module.exports.readStdin = readStdin;
module.exports.parseElastic = parseElastic;
