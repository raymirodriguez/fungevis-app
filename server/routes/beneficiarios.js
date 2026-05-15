const express = require('express');
const router = express.Router();
const { authMiddleware, getDb } = require('./middleware');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const db = getDb(req);
  try {
    const { ci, nombre } = req.query;
    let query = 'SELECT * FROM beneficiarios WHERE 1=1';
    const params = [];
    if (ci) { query += ' AND (ci_titular LIKE ? OR ci_beneficiario LIKE ?)'; params.push(`%${ci}%`, `%${ci}%`); }
    if (nombre) { query += ' AND (nombres LIKE ? OR apellidos LIKE ?)'; params.push(`%${nombre}%`, `%${nombre}%`); }
    query += ' ORDER BY created_at DESC LIMIT 200';
    res.json(db.prepare(query).all(...params));
  } finally { db.close(); }
});

router.get('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const row = db.prepare('SELECT * FROM beneficiarios WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } finally { db.close(); }
});

router.post('/', (req, res) => {
  const db = getDb(req);
  try {
    // Auto-assign num_benef if not provided
    if (!req.body.num_benef && req.body.ci_titular) {
      const count = db.prepare('SELECT COUNT(*) as cnt FROM beneficiarios WHERE ci_titular = ?').get(req.body.ci_titular);
      req.body.num_benef = `B-${count.cnt + 1}`;
    }
    const fields = Object.keys(req.body).join(', ');
    const placeholders = Object.keys(req.body).map(() => '?').join(', ');
    const result = db.prepare(`INSERT INTO beneficiarios (${fields}) VALUES (${placeholders})`).run(...Object.values(req.body));
    res.status(201).json({ id: result.lastInsertRowid });
  } finally { db.close(); }
});

router.put('/:id', (req, res) => {
  const db = getDb(req);
  try {
    const sets = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    db.prepare(`UPDATE beneficiarios SET ${sets} WHERE id = ?`).run(...Object.values(req.body), req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

router.delete('/:id', (req, res) => {
  const db = getDb(req);
  try {
    db.prepare('DELETE FROM beneficiarios WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } finally { db.close(); }
});

module.exports = router;
