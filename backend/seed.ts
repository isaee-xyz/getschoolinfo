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
const DATA_FILE = path.join(process.cwd(), `../${process.argv[2] || 'BATHIDNA.json'}`);
const SCHEMA_FILE = path.join(process.cwd(), 'schema.sql');

async function seed() {
    try {
        console.log(`🌱 Starting seed process using ${process.argv[2] || 'BATHIDNA.json'}...`);

        // 1. Read Schema (Skip if custom file provided to append data)
        if (!process.argv[2]) {
            const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
            await pool.query(schemaSql);
            console.log('✅ Schema applied.');
        }

        // 2. Read Data
        if (!fs.existsSync(DATA_FILE)) {
            console.error(`❌ Data file not found: ${DATA_FILE}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const schools = JSON.parse(rawData);
        console.log(`📊 Found ${schools.length} schools to import.`);

        // 0A. Fix Schema (Auto-Migration)
        // ensure stats columns are 10,2 to prevent overflow (some legacy setups have 5,2)
        try {
            console.log("🛠️ Checking/Fixing Schema Column Types...");
            await pool.query(`
                ALTER TABLE school_stats 
                ALTER COLUMN student_teacher_ratio TYPE DECIMAL(10, 2),
                ALTER COLUMN gender_parity_index TYPE DECIMAL(10, 2),
                ALTER COLUMN bed_qualification_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN teacher_training_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN regular_teacher_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN students_per_classroom TYPE DECIMAL(10, 2),
                ALTER COLUMN boys_toilets_per_1000 TYPE DECIMAL(10, 2),
                ALTER COLUMN girls_toilets_per_1000 TYPE DECIMAL(10, 2),
                ALTER COLUMN furniture_availability_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN instructional_days_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN post_graduate_pct TYPE DECIMAL(10, 2),
                ALTER COLUMN devices_per_100 TYPE DECIMAL(10, 2),
                ALTER COLUMN displays_per_classroom TYPE DECIMAL(10, 2);
            `);
            console.log("✅ Schema columns upgraded to DECIMAL(10, 2).");
        } catch (e) {
            console.log("⚠️ Schema update skipped (likely already correct or table missing):", e);
        }

        // 0. Fetch Valid Columns AND Types from DB
        const schemaRes = await pool.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns 
            WHERE table_name = 'schools'
        `);

        const columnTypes = new Map<string, string>();
        for (const r of schemaRes.rows) {
            columnTypes.set(r.column_name, r.data_type === 'USER-DEFINED' ? r.udt_name : r.data_type);
        }
        console.log(`✅ Loaded ${columnTypes.size} columns with types.`);

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

                // Complex Data Structures
                const infraDetails = {
                    classrooms_good: s.clsrmsGd,
                    classrooms_major_repair: s.clsrmsMaj,
                    smart_boards: s.digiBoardTot,
                    projectors: s.projectorTot,
                    computers: s.desktopFun + s.laptopTot,
                    toilets_boys: s.toiletbFun,
                    toilets_girls: s.toiletgFun,
                    drinking_water: s.drinkWaterYnDesc?.includes('Yes'),
                    electricity: s.electricityYnDesc?.includes('Yes'),
                    library: s.libraryYnDesc?.includes('Yes'),
                    playground: s.playgroundYnDesc?.includes('Yes'),
                    // New fields for legacy frontend support
                    boundary_wall_type: s.bndrywallType,
                    ramps: s.rampsYn,
                    fire_safety: s.fireSafetyYn,
                    building_status: s.bldStatus
                };

                const teacherDetails = {
                    total: s.totalTeacher,
                    regular: s.tchReg,
                    contract: s.tchCont,
                    graduate_above: s.totTchGraduateAbove,
                    post_graduate_above: s.totTchPgraduateAbove,
                    trained: s.tchRecvdServiceTrng
                };

                const imagesData = {
                    main: null, // Placeholder for future logic
                    gallery: []
                };

                // Slug Logic: [block-10]-[school-30]-[udise-5]
                const cleanSlugPart = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                const blockSlug = cleanSlugPart(s.blockName).slice(0, 10).replace(/-+$/, '');
                const nameSlug = cleanSlugPart(s.schoolName).slice(0, 30).replace(/-+$/, '');
                const udiseRaw = (s.udise_code || s.udiseschCode || '00000').toString();
                const udiseSuffix = udiseRaw.length > 5 ? udiseRaw.slice(-5) : udiseRaw;

                // Final Slug
                const slug = `${blockSlug}-${nameSlug}-${udiseSuffix}`;

                // Dynamic Insert Logic for 270+ columns
                const schoolObj = s as Record<string, any>; // Fix implicit any

                // 1. Get all keys from school object
                const keys = Object.keys(schoolObj).filter(k =>
                    columnTypes.has(k) && // ONLY allow keys that exist in DB
                    k !== 'udise_code' && k !== 'udiseschCode' // Handle PK separate
                );

                // Let's normalize keys
                const dbColumns = [];
                const values = [];

                // Handle PK explicitly if potential mismatch
                let finalUdiseCode = schoolObj.udise_code || schoolObj.udiseschCode;

                function safeInt(val: any): number {
                    const num = parseInt(val, 10);
                    if (isNaN(num)) return 0;
                    if (num > 2147483647) return 2147483647;
                    if (num < -2147483648) return -2147483648;
                    return num;
                }

                function safeBigInt(val: any): string {
                    // JS parsInt is unsafe for large BigInts, use string handling
                    if (!val) return '0';
                    // Verify digits
                    const str = String(val).replace(/[^0-9]/g, '');
                    // Postgres BIGINT max is 9223372036854775807 (19 digits)
                    // If too long, truncate or 0? Truncate to 18 digits to be safe
                    if (str.length > 18) return str.substring(0, 18);
                    return str || '0';
                }

                function safeSmallInt(val: any): number {
                    const num = parseInt(val, 10);
                    if (isNaN(num)) return 0;
                    if (num > 32767) return 32767;
                    if (num < -32768) return -32768;
                    return num;
                }

                function safeString(val: any): string {
                    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
                    if (val === undefined || val === null) return '';
                    return String(val); // Postgres handles TEXT fine, but for VARCHAR(N) validation is implicit
                }

                for (const k of keys) {
                    dbColumns.push(`"${k}"`);
                    let val = schoolObj[k];
                    const type = columnTypes.get(k) || 'text';

                    // Unified Type-Based Sanitization
                    if (k === 'latitude') {
                        let f = parseFloat(val);
                        if (isNaN(f)) f = 0;
                        if (f > 90) f = 90;
                        if (f < -90) f = -90;
                        val = f;
                    } else if (k === 'longitude') {
                        let f = parseFloat(val);
                        if (isNaN(f)) f = 0;
                        if (f > 180) f = 180;
                        if (f < -180) f = -180;
                        val = f;
                    } else if (type === 'integer') {
                        val = safeInt(val);
                    } else if (type === 'smallint') {
                        val = safeSmallInt(val);
                    } else if (type === 'bigint') {
                        val = safeBigInt(val);
                    } else if (type === 'numeric' || type === 'decimal' || type === 'double precision' || type === 'real') {
                        const f = parseFloat(val);
                        val = isNaN(f) ? 0 : f;
                    } else if (typeof val === 'object' && val !== null && type !== 'jsonb' && type !== 'json') {
                        val = JSON.stringify(val);
                    } else if (type === 'jsonb' || type === 'json') {
                        if (typeof val === 'string') {
                            try { JSON.parse(val); } catch (e) { val = '{}'; }
                        } else if (typeof val !== 'object') {
                            val = '{}';
                        }
                    } else {
                        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                    }

                    values.push(val);
                }

                // Add PK
                dbColumns.unshift('"udise_code"');
                values.unshift(finalUdiseCode);

                const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
                const columnsStr = dbColumns.join(', ');

                const query = `
                    INSERT INTO schools (${columnsStr}) 
                    VALUES (${placeholders})
                    ON CONFLICT (udise_code) DO NOTHING
                    RETURNING udise_code;
                `;

                await pool.query(query, values);

                // Deleted logic for additional tables as per 2-table schema.

                // --- DERIVED STATS INSERTION ---

                // Stats Calculation
                const str = s.totalTeacher > 0 ? (s.rowTotal / s.totalTeacher).toFixed(2) : 0;
                const totalStudents = s.rowTotal || 1;
                const totalTeachers = s.totalTeacher || 1;
                const boys = s.rowBoyTotal || 1;
                const girls = s.rowGirlTotal || 1;
                const classrooms = s.clsrmsGd || 1;

                // Safety for optional fields
                const profQual3 = (s as any).profQual3 || 0;
                const instructionalDays = (s as any).instructionalDays || 0;
                const stusHvFurnt = (s as any).stusHvFurnt || 0;
                const tablets = (s as any).tabletsFun || 0;

                const statsValues = [
                    finalUdiseCode,
                    slug,
                    s.schoolName,
                    s.boardSecName || 'NA',
                    s.schTypeDesc || 'NA',
                    s.schMgmtDesc || 'NA',
                    parseInt(s.estdYear) || null,

                    s.address || `${s.village}, ${s.blockName}, ${s.districtName}`,
                    s.districtName,
                    s.stateName,
                    s.pincode,
                    s.latitude || 0, // Ensure numeric or null? Schema allows numeric.
                    s.longitude || 0,

                    JSON.stringify(imagesData),

                    tuition,
                    admission,

                    // Metrics
                    str, // STR
                    (girls / boys).toFixed(2), // GPI
                    ((profQual3 / totalTeachers) * 100).toFixed(2), // B.Ed
                    ((s.tchRecvdServiceTrng / totalTeachers) * 100).toFixed(2), // Training
                    ((s.tchReg / totalTeachers) * 100).toFixed(2), // Regular
                    (totalStudents / classrooms).toFixed(2), // SPC
                    ((s.toiletbFun / boys) * 1000).toFixed(2), // Boys T
                    ((s.toiletgFun / girls) * 1000).toFixed(2), // Girls T
                    ((stusHvFurnt / totalStudents) * 100).toFixed(2), // Furn
                    ((instructionalDays / 220) * 100).toFixed(2), // Inst Days
                    ((s.totTchPgraduateAbove / totalTeachers) * 100).toFixed(2), // PG
                    (((s.desktopFun + s.laptopTot + tablets) / totalStudents) * 100).toFixed(2), // Dev
                    (((s.projectorTot + s.digiBoardTot) / classrooms).toFixed(2)), // Disp
                    s.blockName // ($30)
                ];

                await pool.query(`
                    INSERT INTO school_stats (
                        udise_code, slug, name,
                        board, school_type, management, estd_year,
                        address, district, block, state, pincode, latitude, longitude,
                        images, tuition_fee, admission_fee,
                        student_teacher_ratio, gender_parity_index, bed_qualification_pct,
                        teacher_training_pct, regular_teacher_pct, students_per_classroom,
                        boys_toilets_per_1000, girls_toilets_per_1000, furniture_availability_pct,
                        instructional_days_pct, post_graduate_pct, devices_per_100, displays_per_classroom
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, 
                        $8, $9, $30, $10, $11, $12, $13, 
                        $14, $15, $16,
                        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
                    )
                    ON CONFLICT (udise_code) DO NOTHING
                `, statsValues);

                successCount++;
                if (successCount % 100 === 0) process.stdout.write('.');
            } catch (err: any) {
                console.warn(`\n⚠️ Failed to insert ${s.schoolName}: ${err.message}`);
                if (err.detail) console.warn(`   Detail: ${err.detail}`);
                if (err.column) console.warn(`   Column: ${err.column}`);
                if (err.dataType) console.warn(`   Type: ${err.dataType}`);
                // Debug: print values causing overflow
                if (err.message.includes('overflow')) {
                    // find relevant numeric keys
                    const relevant = Object.entries(s).filter(([k, v]) =>
                        typeof v === 'number' && (v > 2147483647 || String(v).length > 9)
                    );
                    console.warn(`   Possible Culprits: ${JSON.stringify(relevant)}`);
                }
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
