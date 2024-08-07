const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'json',
  'dbStatus.json'
);

let dbStatus = 'online';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    dbStatus = JSON.parse(data).status;
  } catch (err) {
    console.error('Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  dbStatus = 'online';
  fs.writeFileSync(
    statusFilePath,
    JSON.stringify({ status: dbStatus }),
    'utf8'
  );
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    dbStatus = status;
    fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
  } else {
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => dbStatus;

exports.startDb = () => {
  if (dbStatus === 'offline') {
    dbStatus = 'online';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
  } else {
    throw new Error('Datenbank ist bereits online oder im Wartungsmodus');
  }
};

exports.stopDb = () => {
  if (dbStatus === 'online') {
    dbStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
  } else {
    throw new Error('Datenbank ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartDb = () => {
  if (dbStatus === 'online') {
    dbStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: dbStatus }),
      'utf8'
    );
    setTimeout(() => {
      dbStatus = 'online';
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: dbStatus }),
        'utf8'
      );
    }, 5000);
  } else {
    throw new Error('Datenbank ist bereits offline oder im Wartungsmodus');
  }
};
