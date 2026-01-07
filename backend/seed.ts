import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'school_db_dev',
    port: parseInt(process.env.DB_PORT || '5432'),
});

// Robust path resolution regardless of CJS/ESM
const DATA_FILE = path.join(process.cwd(), '../BATHIDNA.json');
const SCHEMA_FILE = path.join(process.cwd(), 'schema.sql');

async function seed() {
    try {
        console.log('🌱 Starting seed process...');

        // 1. Read Schema
        const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Schema applied.');

        // 2. Read Data
        if (!fs.existsSync(DATA_FILE)) {
            console.error(`❌ Data file not found: ${DATA_FILE}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const schools = JSON.parse(rawData);
        console.log(`📊 Found ${schools.length} schools to import.`);

        // 3. Insert Data
        let successCount = 0;
        for (const s of schools) {
            try {
                // Extract Fees (heuristic: default to primary, fallback to others)
                const fees = s.feeStructure?.primary || s.feeStructure?.middle || s.feeStructure?.secondary || {};
                const tuition = fees.tuitionFeeInRupees || 0;
                const admission = fees.admissionFeeInRupees || 0;

                // Extract Booleans
                const hasPlayground = s.playgroundYnDesc?.includes('Yes') || false;
                const hasLibrary = s.libraryYnDesc?.includes('Yes') || false;
                const hasInternet = s.internetYnDesc?.includes('Yes') || false;
                const hasComputers = (s.desktopFun + s.laptopTot) > 0;
                const hasSmartClass = s.digiBoardTot > 0;

                // Slug Logic: [block-10]-[school-30]-[udise-5]
                const cleanSlugPart = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                const blockSlug = cleanSlugPart(s.blockName).slice(0, 10).replace(/-+$/, '');
                const nameSlug = cleanSlugPart(s.schoolName).slice(0, 30).replace(/-+$/, '');
                const udiseRaw = (s.udise_code || s.udiseschCode || '00000').toString();
                const udiseSuffix = udiseRaw.length > 5 ? udiseRaw.slice(-5) : udiseRaw;

                // Final Slug
                const slug = `${blockSlug}-${nameSlug}-${udiseSuffix}`;

                await pool.query(
                    `INSERT INTO schools (
            udise_code, slug, name, address, district, block, state, pincode, 
            latitude, longitude, management, category, type, 
            low_class, high_class, estd_year, 
            total_students, total_teachers, student_teacher_ratio,
            has_playground, has_library, has_computers, has_internet, has_smart_class,
            admission_fee, tuition_fee, fee_structure, leadership
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
          ON CONFLICT (udise_code) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name`,
                    [
                        s.udise_code || s.udiseschCode,
                        slug,
                        s.schoolName,
                        s.address,
                        s.districtName,
                        s.blockName,
                        s.stateName,
                        s.pincode,
                        s.latitude,
                        s.longitude,
                        s.schMgmtDesc,
                        s.schCategoryDesc,
                        s.schTypeDesc,
                        s.lowClass,
                        s.highClass,
                        parseInt(s.estdYear) || null,
                        s.rowTotal,
                        s.totalTeacher,
                        s.totalTeacher > 0 ? (s.rowTotal / s.totalTeacher).toFixed(2) : 0,
                        hasPlayground,
                        hasLibrary,
                        hasComputers,
                        hasInternet,
                        hasSmartClass,
                        admission,
                        tuition,
                        JSON.stringify(s.feeStructure || {}),
                        JSON.stringify(s.leadership || {})
                    ]
                );
                successCount++;
                if (successCount % 100 === 0) process.stdout.write('.');
            } catch (err) {
                console.warn(`\n⚠️ Failed to insert ${s.schoolName}: ${err}`);
            }
        }

        console.log(`\n✅ Successfully seeded ${successCount} schools.`);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await pool.end();
    }
}

seed();
