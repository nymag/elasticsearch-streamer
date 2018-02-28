#!/usr/bin/env node
'use strict';

const initCmd = require('./cmd/init-cmd'),
  runningAsScript = !module.parent;

if (runningAsScript) initCmd();
module.exports.get = require('./lib/put-docs');
module.exports.put = require('./lib/get-docs');
