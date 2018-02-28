const getArgs = require('./get-args'),
  getDocs = require('../lib/get-docs'),
  putDocs = require('../lib/put-docs'),
  h = require('highland'),
  urlUtil = require('url'),
  _ = require('lodash'),
  util = require('../lib/util');

function cmdGetDocs(args) {
  return getDocs(args._[1], {parse: false, query: args.query});
}

function cmdPutDocs(args) {

  return util.readStdin()
    .map(JSON.parse)
    .through(_.partialRight(putDocs, args._[1], args.batch))
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
