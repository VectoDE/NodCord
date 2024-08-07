const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(
  __dirname,
  '..',
  '..',
  'public',
  'json',
  'botStatus.json'
);

let botStatus = 'offline';

if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    botStatus = JSON.parse(data).status;
  } catch (err) {
    console.error('Fehler beim Lesen der Statusdatei:', err);
  }
} else {
  botStatus = 'offline';
  fs.writeFileSync(
    statusFilePath,
    JSON.stringify({ status: botStatus }),
    'utf8'
  );
}

exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    botStatus = status;
    fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
  } else {
    throw new Error('Ungültiger Status');
  }
};

exports.getStatus = () => botStatus;

exports.startBot = () => {
  if (botStatus === 'offline') {
    botStatus = 'online';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
  } else {
    throw new Error('Bot ist bereits online oder im Wartungsmodus');
  }
};

exports.stopBot = () => {
  if (botStatus === 'online') {
    botStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
  } else {
    throw new Error('Bot ist bereits offline oder im Wartungsmodus');
  }
};

exports.restartBot = () => {
  if (botStatus === 'online') {
    botStatus = 'offline';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
    setTimeout(() => {
      botStatus = 'online';
      fs.writeFileSync(
        statusFilePath,
        JSON.stringify({ status: botStatus }),
        'utf8'
      );
    }, 5000);
  } else {
    throw new Error('Bot ist bereits offline oder im Wartungsmodus');
  }
};

exports.setMaintenance = () => {
  if (botStatus !== 'maintenance') {
    botStatus = 'maintenance';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
  } else {
    throw new Error('Bot ist bereits im Wartungsmodus');
  }
};

exports.removeMaintenance = () => {
  if (botStatus === 'maintenance') {
    botStatus = 'online';
    fs.writeFileSync(
      statusFilePath,
      JSON.stringify({ status: botStatus }),
      'utf8'
    );
  } else {
    throw new Error('Bot ist nicht im Wartungsmodus');
  }
};
