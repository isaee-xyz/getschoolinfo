const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'school_db_dev',
    port: parseInt(process.env.DB_PORT || '5432'),
});

const DATA_FILE = path.join(process.cwd(), process.argv[2] || '../All_District_Data.json');
const SCHEMA_FILE = path.join(process.cwd(), 'schema.sql');

async function seed() {
    try {
        console.log(`🌱 Starting seed process...`);

        // 1. Read Data
        if (!fs.existsSync(DATA_FILE)) {
            console.error(`❌ Data file not found: ${DATA_FILE}`);
            process.exit(1);
        }

        const rawData = fs.readFileSync(DATA_FILE, 'utf8');
        const schools = JSON.parse(rawData);
        console.log(`📊 Found ${schools.length} schools to import.`);

        // 2. Insert Data
        let successCount = 0;
        for (const s of schools) {
            try {
                // Extract Fees
                const fees = s.feeStructure?.primary || s.feeStructure?.middle || s.feeStructure?.secondary || {};
                const tuition = fees.tuitionFeeInRupees || 0;
                const admission = fees.admissionFeeInRupees || 0;

                // Extract Booleans
                const hasPlayground = s.playgroundYnDesc?.includes('Yes') || false;
                const hasLibrary = s.libraryYnDesc?.includes('Yes') || false;
                const hasInternet = s.internetYnDesc?.includes('Yes') || false;
                const hasComputers = (s.desktopFun + s.laptopTot) > 0;
                const hasSmartClass = s.digiBoardTot > 0;

                const imagesData = {
                    main: null,
                    gallery: []
                };

                // Slug Logic
                const cleanSlugPart = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                const blockSlug = cleanSlugPart(s.blockName).slice(0, 10).replace(/-+$/, '');
                const nameSlug = cleanSlugPart(s.schoolName).slice(0, 30).replace(/-+$/, '');
                const udiseRaw = (s.udise_code || s.udiseschCode || '00000').toString();
                const udiseSuffix = udiseRaw.length > 5 ? udiseRaw.slice(-5) : udiseRaw;
                const slug = `${blockSlug}-${nameSlug}-${udiseSuffix}`;

                const schoolObj = s;
                const keys = Object.keys(schoolObj).filter(k =>
                    k !== '_id' &&
                    !k.toLowerCase().includes('genius') &&
                    schoolObj[k] !== undefined
                );

                const dbColumns = [];
                const values = [];
                let finalUdiseCode = schoolObj.udise_code || schoolObj.udiseschCode;

                for (const k of keys) {
                    if (k === 'udise_code' || k === 'udiseschCode') continue;
                    dbColumns.push(`"${k}"`);
                    let val = schoolObj[k];
                    if (typeof val === 'object' && val !== null) {
                        val = JSON.stringify(val);
                    }
                    values.push(val);
                }

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

                // Stats Calculation
                const str = s.totalTeacher > 0 ? (s.rowTotal / s.totalTeacher).toFixed(2) : 0;
                const totalStudents = s.rowTotal || 1;
                const totalTeachers = s.totalTeacher || 1;
                const boys = s.rowBoyTotal || 1;
                const girls = s.rowGirlTotal || 1;
                const classrooms = s.clsrmsGd || 1;
                const profQual3 = s.profQual3 || 0;
                const instructionalDays = s.instructionalDays || 0;
                const stusHvFurnt = s.stusHvFurnt || 0;
                const tablets = s.tabletsFun || 0;

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
                    s.latitude || 0,
                    s.longitude || 0,
                    JSON.stringify(imagesData),
                    tuition,
                    admission,
                    str,
                    (girls / boys).toFixed(2),
                    ((profQual3 / totalTeachers) * 100).toFixed(2),
                    ((s.tchRecvdServiceTrng / totalTeachers) * 100).toFixed(2),
                    ((s.tchReg / totalTeachers) * 100).toFixed(2),
                    (totalStudents / classrooms).toFixed(2),
                    ((s.toiletbFun / boys) * 1000).toFixed(2),
                    ((s.toiletgFun / girls) * 1000).toFixed(2),
                    ((stusHvFurnt / totalStudents) * 100).toFixed(2),
                    ((instructionalDays / 220) * 100).toFixed(2),
                    ((s.totTchPgraduateAbove / totalTeachers) * 100).toFixed(2),
                    (((s.desktopFun + s.laptopTot + tablets) / totalStudents) * 100).toFixed(2),
                    (((s.projectorTot + s.digiBoardTot) / classrooms).toFixed(2)),
                    s.blockName
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
            } catch (err) {
                console.error(`Failed to insert school ${s.schoolName}:`, err);
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
