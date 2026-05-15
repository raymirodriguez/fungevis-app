const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fungevis_secret_key_2024';
const CREDENTIALS = { username: 'admin', password: 'fungevis2024' };

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== CREDENTIALS.username || password !== CREDENTIALS.password) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, username });
});

module.exports = router;
