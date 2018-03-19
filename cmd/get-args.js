'use strict';

const yargs = require('yargs');

module.exports = () => yargs
  .command('get', 'gets docs from index', yargs => yargs
    .coerce('options', JSON.parse)
  )
  .command('put', 'put docs into index', yargs =>
    yargs
      .number('batch')
  )
  .argv;
