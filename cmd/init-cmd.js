const getArgs = require('./get-args'),
  getDocs = require('../lib/get-docs'),
  putDocs = require('../lib/put-docs'),
  h = require('highland'),
  urlUtil = require('url'),
  _ = require('lodash'),
  util = require('../lib/util');

function parseElastic(args) {
  const split = args._[1].split('/');

  return {
    index: split[split.length - 1],
    host: split.slice(0, split.length - 1).join('/')
  };
}

function cmdGetDocs(args) {
  const {host, index} = parseElastic(args);

  return getDocs(host, index, {parse: false, query: args.query});
}

function cmdPutDocs(args) {
  const {host, index} = parseElastic(args);

  return util.readStdin()
    .map(JSON.parse)
    .through(_.partialRight(putDocs, host, index, args.batch))
    .map(JSON.stringify);
}

function getSrcStream() {
  const args = getArgs();

  switch (args._[0]) {
    case 'get':
      return cmdGetDocs(args);
    case 'put':
      return cmdPutDocs(args);
  }
}

function initCmd() {
  const args = getArgs();

  return getSrcStream()
    .each(h.log);
}

module.exports = initCmd;
