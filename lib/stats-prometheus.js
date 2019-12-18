/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {asyncHandler} = require('bedrock-express');
const bedrock = require('bedrock');
const brStats = require('bedrock-stats');
const {util: {BedrockError}} = bedrock;

const storageApi = 'redis';

let monitorId;

bedrock.events.on('bedrock-express.configure.routes', app => {
  app.get('/prometheus', asyncHandler(async (req, res) => {
    monitorId = monitorId || await _getMonitorId();
    const {createdDate, report} = await _getReport({monitorId});

    // version corresponds to Prometheus exposition format version
    res.writeHead(200, {'Content-Type': 'text/plain; version=0.0.4'});

    for(const metric in report) {
      if(typeof report[metric] === 'number') {
        res.write(`${metric} ${report[metric]} ${createdDate}\n`);
      }
    }
    res.end();
  }));
});

async function _getMonitorId() {
  const monitorIds = await brStats.getMonitorIds({storageApi});
  for(const monitorId of monitorIds) {
    if(monitorId.startsWith('ledgerNode')) {
      return monitorId;
    }
  }
  throw new BedrockError('Monitor not found.', 'NotFoundError');
}

async function _getReport({monitorId}) {
  const reports = await brStats.getReports({
    query: {monitorIds: [monitorId]},
    storageApi,
  });
  const lastReport = reports[reports.length - 1];
  const {createdDate, monitors: {
    [monitorId]: {continuity: report}
  }} = lastReport;

  report.blockHeight = report.latestSummary.eventBlock.block.blockHeight;

  return {createdDate, report};
}
