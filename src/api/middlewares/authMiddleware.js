const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      // Kein Token vorhanden, Fehler an die Fehlerbehandlungsmiddleware weiterleiten
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isAuthenticated) {
      // Benutzer nicht gefunden oder nicht authentifiziert, Fehler an die Fehlerbehandlungsmiddleware weiterleiten
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }

    // Benutzer ist authentifiziert
    res.locals.isAuthenticated = true;
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Fehler bei der Authentifizierung, an die Fehlerbehandlungsmiddleware weiterleiten
    const err = new Error('Unauthorized');
    err.status = 401;
    next(err);
  }
};

module.exports = authMiddleware;
