'use strict';

module.exports = require('yargs')
  .string('index')
  .string('fromElasticHost')
  .string('toElasticHost')
  .string('fromPrefix')
  .string('toPrefix')
  .number('batch')
  .number('offset')
  .number('limit')
  .default('fromPrefix', '')
  .default('toPrefix', '')
  .default('batch', 5000)
  .demandOption(['fromElasticHost', 'toElasticHost'])
  .argv;
