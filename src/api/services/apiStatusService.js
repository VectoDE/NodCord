const fs = require('fs');
const path = require('path');

// Pfad zur Statusdatei
const statusFilePath = path.join(__dirname, '..', '..', 'status.json');

// Standardstatus auf 'online' setzen
let apiStatus = 'online';

// Überprüfen, ob die Statusdatei existiert, und den Status auslesen
if (fs.existsSync(statusFilePath)) {
  try {
    const data = fs.readFileSync(statusFilePath, 'utf8');
    apiStatus = JSON.parse(data).status;
  } catch (err) {
    console.error('Fehler beim Lesen der Statusdatei:', err);
  }
}

// Funktion, um den Status der API zu setzen
exports.setStatus = (status) => {
  if (['online', 'offline', 'maintenance'].includes(status)) {
    apiStatus = status;
    fs.writeFileSync(statusFilePath, JSON.stringify({ status }), 'utf8');
  } else {
    throw new Error('Ungültiger Status');
  }
};

// Funktion, um den aktuellen Status der API abzurufen
exports.getStatus = () => apiStatus;