const mongoose = require('mongoose');

// Definiere das Schema für Server-Informationen
const serverSchema = new mongoose.Schema({
    uptime: {
        type: Number, // Zeit in Sekunden, die der Server aktiv ist
        required: true
    },
    cpuUsage: {
        type: Number, // CPU-Auslastung in Prozent
        required: true
    },
    memoryUsage: {
        type: Number, // RAM-Auslastung in MB
        required: true
    },
    diskUsage: {
        type: Number, // Speicherplatz-Auslastung in GB
        required: true
    },
    version: {
        type: String, // Versionsnummer des Servers
        required: true
    },
}, {
    timestamps: true // Erstellt automatisch `createdAt` und `updatedAt` Felder
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Server', serverSchema);