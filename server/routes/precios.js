const express = require('express');
const router = express.Router();
const { authMiddleware, getDb } = require('./middleware');

router.use(authMiddleware);

router.get('/personal-salud', (req, res) => {
  const db = getDb(req);
  try {
    res.json(db.prepare('SELECT * FROM precios_personal_salud ORDER BY especialidad').all());
  } finally { db.close(); }
});

router.get('/ecografias', (req, res) => {
  const db = getDb(req);
  try {
    res.json(db.prepare('SELECT * FROM precios_ecografias ORDER BY imagen, estudio').all());
  } finally { db.close(); }
});

router.get('/rx', (req, res) => {
  const db = getDb(req);
  try {
    res.json(db.prepare('SELECT * FROM precios_rx ORDER BY estudio').all());
  } finally { db.close(); }
});

router.get('/planes', (req, res) => {
  const db = getDb(req);
  try {
    res.json(db.prepare('SELECT * FROM beneficios_plan').all());
  } finally { db.close(); }
});

module.exports = router;
