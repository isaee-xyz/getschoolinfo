import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { initializeFirebase } from './firebase';

dotenv.config();

// Initialize Firebase
try {
  initializeFirebase();
} catch (e) {
  console.warn("Firebase initialization failed (check credentials):", e);
}

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/schools', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM schools');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/school/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    // Try matching by slug first
    let result = await pool.query('SELECT * FROM schools WHERE slug = $1', [slug]);

    // Fallback: Try matching by ID if slug might be an ID (legacy support / direct ID access)
    if (result.rows.length === 0 && !isNaN(Number(slug))) {
      result = await pool.query('SELECT * FROM schools WHERE id = $1', [slug]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
