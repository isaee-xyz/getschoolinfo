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
const port = process.env.PORT || 5000;

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
    const result = await pool.query('SELECT * FROM schools LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
