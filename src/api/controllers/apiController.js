const { Router } = require('express');
const package = require('../../../package.json');
const apiStatusService = require('../services/apiStatusService');

// Beispiel-Daten
const apiData = {
  name: package.name,
  version: package.version,
  status: apiStatusService.getStatus()
};

// API-Status
exports.getStatus = (req, res) => {
  res.json(apiData);
};

// API-Info
exports.getInfo = (req, res) => {
  res.json({
    name: apiData.name,
    version: apiData.version,
    status: apiData.status
  });
};