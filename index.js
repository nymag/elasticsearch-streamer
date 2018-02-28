#!/usr/bin/env node
'use strict';

const getDocs = require('./lib/get-docs'),
  putDocs = require('./lib/put-docs'),
  initCmd = require('./cmd/init-cmd'),
  runningAsScript = !module.parent;

if (runningAsScript) initCmd();
module.exports.getDocs = getDocs;
module.exports.putDocs = putDocs;
