import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: false // Use false for localhost if not properly configured
});

async function check() {
    try {
        console.log("🔍 Connecting to DB:", process.env.DB_NAME);

        const total = await pool.query('SELECT COUNT(*) FROM schools');
        console.log(`\n📊 Total Schools: ${total.rows[0].count}`);

        const districts = await pool.query(`
            SELECT "districtName", COUNT(*) as c 
            FROM schools 
            GROUP BY "districtName" 
            ORDER BY c DESC 
            LIMIT 10
        `);

        console.log("\n🏙️  Top 10 Districts:");
        districts.rows.forEach(r => console.log(`   - ${r.districtName}: ${r.c}`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        pool.end();
    }
}

check();
