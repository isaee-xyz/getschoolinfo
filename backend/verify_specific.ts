
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'schooldb',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function check() {
    try {
        const res = await pool.query("SELECT name, slug FROM schools WHERE name ILIKE '%DIFFERENT CON SCHOOL GHUDDA%'");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
