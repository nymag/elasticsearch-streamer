'use strict';

const yargs = require('yargs');

module.exports = () => yargs
  .command('get [endpoint]', 'gets docs from index', yargs => yargs
    .positional('endpoint', {type: 'string'})
    .demandOption('endpoint')
    .coerce('search', JSON.parse)
  )
  .command('put [endpoint]', 'put docs into index', yargs =>
    yargs
      .positional('endpoint', {type: 'string'})
      .demandOption('endpoint')
      .number('batch')
  )
  .command('upsert [endpoint]', 'uspert docs into index', yargs =>
    yargs
      .positional('endpoint', {type: 'string'})
      .demandOption('endpoint')
      .number('batch')
  )
  .command('delete [endpoint]', 'delete docs from index', yargs =>
    yargs
      .positional('endpoint', {type: 'string'})
      .demandOption('endpoint')
      .number('batch')
  )
  .argv;
