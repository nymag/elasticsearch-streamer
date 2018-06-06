'use strict';

const getArgs = require('./get-args'),
  getDocs = require('../lib/get-docs'),
  putDocs = require('../lib/put-docs'),
  deleteDocs = require('../lib/delete-docs'),
  upsertDocs = require('../lib/upsert-docs'),
  h = require('highland'),
  _ = require('lodash'),
  util = require('../lib/util');

function cmdGetDocs(args) {
  return getDocs(args.endpoint, {
    parse: false,
    search: args.search
  });
}

function cmdPutDocs(args) {
  return util.readStdin()
    .map(JSON.parse)
    .through(_.partialRight(putDocs, args.endpoint, { batch: args.batch }))
    .map(JSON.stringify);
}

function cmdUpsertDocs(args) {
  return util.readStdin()
    .map(JSON.parse)
    .through(_.partialRight(upsertDocs, args.endpoint, { batch: args.batch }))
    .map(JSON.stringify);
}

function cmdDeleteDocs(args) {
  return util.readStdin()
    .map(JSON.parse)
    .through(_.partialRight(deleteDocs, args.endpoint, { batch: args.batch }))
    .map(JSON.stringify);
}

function getSrcStream() {
  const args = getArgs();

  switch (args._[0]) {
    case 'get':
      return cmdGetDocs(args);
    case 'put':
      return cmdPutDocs(args);
    case 'upsert':
      return cmdUpsertDocs(args);
    case 'delete':
      return cmdDeleteDocs(args);
    default:
      throw new Error('Command not recognized');
  }
}

function initCmd() {
  return getSrcStream()
    .each(h.log);
}

module.exports = initCmd;
