const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');

// Erstellen eines neuen Beta Keys
exports.createBetaKey = async (req, res) => {
  const { name } = req.body;
  const key = generateBetaKey();

  try {
    const newBetaKey = new BetaKey({ key, name });
    await newBetaKey.save();
    res.status(201).json({ message: 'Beta Key erstellt', key: newBetaKey });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Erstellen des Beta Keys', error });
  }
};

// Bearbeiten eines Beta Keys
exports.editBetaKey = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedBetaKey = await BetaKey.findByIdAndUpdate(id, { name }, { new: true });
    res.json({ message: 'Beta Key aktualisiert', key: updatedBetaKey });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Beta Keys', error });
  }
};

// Löschen eines Beta Keys
exports.deleteBetaKey = async (req, res) => {
  const { id } = req.params;

  try {
    await BetaKey.findByIdAndDelete(id);
    res.json({ message: 'Beta Key gelöscht' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Löschen des Beta Keys', error });
  }
};

// Aktivieren/Deaktivieren des Beta Systems
exports.toggleBetaSystem = async (req, res) => {
  const { isActive } = req.body;

  try {
    await BetaSystem.findOneAndUpdate({}, { isActive }, { upsert: true });
    res.json({ message: `Beta System ${isActive ? 'aktiviert' : 'deaktiviert'}` });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Umschalten des Beta Systems', error });
  }
};

// Abrufen aller Beta Keys
exports.getBetaKeys = async (req, res) => {
  try {
    const betaKeys = await BetaKey.find().populate('user');
    res.json(betaKeys);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Beta Keys', error });
  }
};

// Verifizieren eines Beta Keys
exports.verifyBetaKey = async (req, res) => {
  const { key } = req.body;

  try {
    const betaKey = await BetaKey.findOne({ key });
    if (betaKey) {
      // Optional: Hier kannst du weitere Aktionen durchführen, z.B. den Beta Key als verwendet markieren
      res.json({ message: 'Beta Key erfolgreich verifiziert' });
    } else {
      res.status(400).json({ message: 'Ungültiger Beta Key' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Verifizierung des Beta Keys', error });
  }
};

// Generierung eines Beta Keys
function generateBetaKey() {
  return 'BETA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}
