'use strict';

const getArgs = require('./get-args'),
  getDocs = require('../lib/get-docs'),
  putDocs = require('../lib/put-docs'),
  h = require('highland'),
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
    case 'put':
      return cmdPutDocs(args);
    case 'get':
      return cmdGetDocs(args);
    default:
      throw new Error('Command not recognized');
  }
}

function initCmd() {
  return getSrcStream()
    .each(h.log);
}

module.exports = initCmd;
