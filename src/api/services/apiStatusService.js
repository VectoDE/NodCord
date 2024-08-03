const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(__dirname, '..', '..', 'public', 'json', 'apiStatus.json');

let apiStatus = 'online';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    apiStatus = JSON.parse(data).status;
  } catch (err) {
    console.error('Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  apiStatus = 'online';
  fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    apiStatus = status;
    fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
  } else {
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => apiStatus;

exports.startApi = () => {
  if (apiStatus === 'offline') {
    apiStatus = 'online';
    fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
  } else {
    throw new Error('API ist bereits online oder im Wartungsmodus');
  }
};

exports.stopApi = () => {
  if (apiStatus === 'online') {
    apiStatus = 'offline';
    fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
  } else {
    throw new Error('API ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartApi = () => {
  if (apiStatus === 'online') {
    apiStatus = 'offline';
    fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
    setTimeout(() => {
      apiStatus = 'online';
      fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
    }, 5000);
  } else {
    throw new Error('API ist bereits offline oder im Wartungsmodus');
  }
};

exports.setMaintenance = () => {
  if (apiStatus !== 'maintenance') {
    apiStatus = 'maintenance';
    fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
  } else {
    throw new Error('API ist bereits im Wartungsmodus');
  }
};

exports.removeMaintenance = () => {
  if (apiStatus === 'maintenance') {
    apiStatus = 'online';
    fs.writeFileSync(statusFilePath, JSON.stringify({ status: apiStatus }), 'utf8');
  } else {
    throw new Error('API ist nicht im Wartungsmodus');
  }
};
