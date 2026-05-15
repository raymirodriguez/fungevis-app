const express = require('express');
const router = express.Router();
const { authMiddleware, getDb } = require('./middleware');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb(req);
  try {
    const { ci, nombre } = req.query;
    let query = 'SELECT * FROM servicios WHERE 1=1';
    const params = [];
    if (ci) { query += ' AND ci_titular LIKE ?'; params.push(`%${ci}%`); }
    if (nombre) { query += ' AND (nombres LIKE ? OR apellidos LIKE ?)'; params.push(`%${nombre}%`, `%${nombre}%`); }
    query += ' ORDER BY created_at DESC LIMIT 200';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } finally { db.close(); }
});

router.get('/ci/:ci', (req, res) => {
  const db = getDb(req);
  try {
    const row = db.prepare('SELECT * FROM servicios WHERE ci_titular = ?').get(req.params.ci);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } finally { db.close(); }
});

router.get('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const row = db.prepare('SELECT * FROM servicios WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } finally { db.close(); }
});

router.post('/', (req, res) => {
  const db = getDb(req);
  try {
    // Auto-generate solicitud_nro if not provided
    if (!req.body.solicitud_nro) {
      const last = db.prepare("SELECT solicitud_nro FROM servicios ORDER BY id DESC LIMIT 1").get();
      let nextNum = 1;
      if (last && last.solicitud_nro) {
        const n = parseInt(last.solicitud_nro, 10);
        if (!isNaN(n)) nextNum = n + 1;
      }
      req.body.solicitud_nro = String(nextNum).padStart(3, '0');
    }
    const fields = Object.keys(req.body).join(', ');
    const placeholders = Object.keys(req.body).map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO servicios (${fields}) VALUES (${placeholders})`);
    const result = stmt.run(...Object.values(req.body));
    res.status(201).json({ id: result.lastInsertRowid, solicitud_nro: req.body.solicitud_nro });
  } finally { db.close(); }
});

router.put('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const sets = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    const stmt = db.prepare(`UPDATE servicios SET ${sets} WHERE id = ?`);
    stmt.run(...Object.values(req.body), req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

router.delete('/:id', (req, res) => {
  const db = getDb(req);
  try {
    db.prepare('DELETE FROM servicios WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

module.exports = router;
