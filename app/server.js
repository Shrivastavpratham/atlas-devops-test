const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ ready: true });
  } catch (e) {
    res.status(500).json({ ready: false, error: e.message });
  }
});

app.get('/', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, ts TIMESTAMP DEFAULT NOW())`);
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const { rows } = await pool.query('SELECT COUNT(*) FROM visits');
    res.json({ message: 'Atlas infra check V2', visits: rows[0].count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('listening on 3000'));
