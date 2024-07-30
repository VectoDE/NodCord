const Server = require('../../models/serverModel');

// Controller-Funktion zum Abrufen von Server-Informationen
exports.getServerInfo = async (req, res) => {
    try {
        const serverInfo = await Server.findOne(); // Gibt die erste gefundene Server-Information zurück
        if (serverInfo) {
            res.status(200).json(serverInfo);
        } else {
            res.status(404).json({ message: 'Server information not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve server information' });
    }
};

// Controller-Funktion zum Aktualisieren von Server-Informationen
exports.updateServerInfo = async (req, res) => {
    const { uptime, cpuUsage, memoryUsage, diskUsage, version } = req.body;

    try {
        const serverInfo = await Server.findOneAndUpdate(
            {}, // Update das erste Dokument, das gefunden wird
            { uptime, cpuUsage, memoryUsage, diskUsage, version },
            { new: true, upsert: true } // `new: true` gibt das aktualisierte Dokument zurück, `upsert: true` erstellt ein neues Dokument, wenn keines gefunden wird
        );
        res.status(200).json(serverInfo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update server information' });
    }
};
