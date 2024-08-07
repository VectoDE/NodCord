const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const logger = require('../services/loggerService');

const API_KEYS_FILE = path.join(__dirname, '../../public/keys/apiKeys.json');

const generateApiKey = (req, res) => {
  try {
    const apiKey = crypto.randomBytes(32).toString('hex');
    let keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));

    keys.push(apiKey);
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');

    logger.logInfo(`Neuer API-Schlüssel erstellt: ${apiKey}`);
    res.status(201).json({ apiKey });
  } catch (error) {
    logger.logError(
      `Fehler beim Erstellen eines neuen API-Schlüssels: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API-Schlüssel fehlt' });
  }

  try {
    const keys = JSON.parse(fs.readFileSync(API_KEYS_FILE, 'utf8'));
    if (keys.includes(apiKey)) {
      next();
    } else {
      res.status(403).json({ message: 'Ungültiger API-Schlüssel' });
    }
  } catch (error) {
    logger.logError(
      `Fehler bei der Überprüfung des API-Schlüssels: ${error.message}`
    );
    res.status(500).json({ error: error.message });
  }
};

const manageBotPermissions = (req, res) => {
  // Hier können Berechtigungen für den Bot verwaltet werden
  // Dies könnte z.B. das Hinzufügen oder Entfernen von Rollen umfassen

  res.status(200).json({ message: 'Berechtigungen verwaltet' });
};

module.exports = {
  generateApiKey,
  verifyApiKey,
  manageBotPermissions,
};
