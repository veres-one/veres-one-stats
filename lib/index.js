/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

require('bedrock-package-manager');
require('bedrock-stats');
require('bedrock-stats-storage-redis');
// node-stats emits the event that continuity responds to for reporting
require('bedrock-ledger-node-stats-monitor');
require('bedrock-ledger-consensus-continuity-stats-monitor');

require('./config');
require('./stats-prometheus');
