const jwt = require('jsonwebtoken');
const { DatabaseSync } = require('node:sqlite');

const JWT_SECRET = process.env.JWT_SECRET || 'fungevis_secret_key_2024';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function getDb(req) {
  const db = new DatabaseSync(req.app.locals.dbPath);
  return db;
}

module.exports = { authMiddleware, getDb };
