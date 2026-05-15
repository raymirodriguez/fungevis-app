const express = require('express');
const cors = require('cors');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Initialize DB
const dbPath = path.join(__dirname, 'db', 'fungevis.db');
const schemaPath = path.join(__dirname, 'db', 'schema.sql');

if (!fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  db.close();
  console.log('Database initialized from schema.');
}

// Make db available to routes
app.locals.dbPath = dbPath;

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/beneficiarios', require('./routes/beneficiarios'));
app.use('/api/atencion-paciente', require('./routes/atencion'));
app.use('/api/centros-aliados', require('./routes/centros'));
app.use('/api/cobranzas', require('./routes/cobranzas'));
app.use('/api/personal-salud', require('./routes/personal'));
app.use('/api/precios', require('./routes/precios'));

app.listen(PORT, () => {
  console.log(`FUNGEVIS Server running on http://localhost:${PORT}`);
});
