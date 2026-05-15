const express = require('express');
const router = express.Router();
const { authMiddleware, getDb } = require('./middleware');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb(req);
  try {
    const { nombre } = req.query;
    let query = 'SELECT * FROM centros_aliados WHERE 1=1';
    const params = [];
    if (nombre) { query += ' AND nombre LIKE ?'; params.push(`%${nombre}%`); }
    query += ' ORDER BY created_at DESC LIMIT 200';
    res.json(db.prepare(query).all(...params));
  } finally { db.close(); }
});

router.get('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const row = db.prepare('SELECT * FROM centros_aliados WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } finally { db.close(); }
});

router.post('/', (req, res) => {
  const db = getDb(req);
  try {
    const fields = Object.keys(req.body).join(', ');
    const placeholders = Object.keys(req.body).map(() => '?').join(', ');
    const result = db.prepare(`INSERT INTO centros_aliados (${fields}) VALUES (${placeholders})`).run(...Object.values(req.body));
    res.status(201).json({ id: result.lastInsertRowid });
  } finally { db.close(); }
});

router.put('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const sets = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE centros_aliados SET ${sets} WHERE id = ?`).run(...Object.values(req.body), req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

router.delete('/:id', (req, res) => {
  const db = getDb(req);
  try {
    db.prepare('DELETE FROM centros_aliados WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

module.exports = router;
