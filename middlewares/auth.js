const jwt = require('jsonwebtoken');

// Verifieert dat er een geldig JWT-token is meegestuurd in de Authorization header.
// Voorbeeld header: Authorization: Bearer <token>
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Geen token meegegeven. Log a.u.b. in." });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email, role, doctorId }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token ongeldig of verlopen. Log a.u.b. opnieuw in." });
  }
}

// Beperkt een route tot bepaalde rollen. Gebruik ALTIJD na verifyToken().
// Voorbeeld: router.post('/', verifyToken, authorizeRoles('doctor'), handler)
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Geen toegang tot deze actie." });
    }
    next();
  };
}

module.exports = { verifyToken, authorizeRoles };

