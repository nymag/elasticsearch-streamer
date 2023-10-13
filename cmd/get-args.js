'use strict';

const yargs = require('yargs');

module.exports = () => yargs
  .command('get', 'gets docs from index', yargs => yargs
    .coerce('search', JSON.parse)
    .number('timeout')
  )
  .command('put', 'put docs into index', yargs =>
    yargs
      .number('batch')
      .number('timeout')
      .boolean('update')
  )
  .argv;
