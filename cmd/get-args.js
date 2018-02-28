'use strict';

const yargs = require('yargs');

module.exports = () => yargs
  .command('get', 'gets docs from index', yargs => yargs
    .coerce('query', val => JSON.parse(val))
  )
  .command('put', 'put docs into index', yargs =>
    yargs
      .number('batch')
  )
  .argv;
