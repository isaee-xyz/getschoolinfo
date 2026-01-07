
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'schooldb',
    port: parseInt(process.env.DB_PORT || '4000', 10), // Port 4000 was set in backend but DB is likely on 5432. Let's try 5432 as standard, or read from env.
});

async function check() {
    try {
        const res = await pool.query('SELECT name, slug FROM schools LIMIT 5');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
