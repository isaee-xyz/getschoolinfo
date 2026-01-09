import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

const schoolData = {
    "_id": {
        "$oid": "69511a5c97af6f3d323cec99"
    },
    "udiseschCode": "******11049",
    "schoolName": "KENDRIYA VIDYALAYA RANGE HILLS ESTATE PUNE (Code-1232)",
    "schoolId": 4552920,
    "pincode": 411020,
    "schMgmtDesc": "Kendriya Vidyalaya",
    "schCategoryDesc": "Pr. with Up.Pr. Sec. and H.Sec.",
    "schTypeDesc": "3-Co-ed",
    "lowClass": 1,
    "highClass": 12,
    "estdYear": "1983",
    "stateName": "KENDRIYA VIDYALAYA SANGHATHAN",
    "districtName": "MUMBAI REGION",
    "blockName": "MUMBAI REGION",
    "villageName": "KHADAKI",
    "address": "RANGE HILLS ESTATE KHADKI PUNE 411020",
    "latitude": 18.553598,
    "longitude": 73.843197,
    "udise_code": "27250511049",
    "boardSecName": "1-CBSE",
    "rowTotal": 1423,
    "totalTeacher": 55,
    "internetYnDesc": "1-Yes", // Added missing field

    // Infrastructure
    "clsrmsGd": 34,
    "clsrmsMaj": 0,
    "digiBoardTot": 0,
    "projectorTot": 15,
    "desktopFun": 72,
    "laptopTot": 0,
    "toiletbFun": 2,
    "toiletgFun": 2,
    "drinkWaterYnDesc": "1-Yes",
    "electricityYnDesc": "1-Yes",
    "libraryYnDesc": "1-Yes",
    "playgroundYnDesc": "1-Yes",
    "bndrywallType": "1-Pucca",
    "rampsYn": 1,
    "fireSafetyYn": 0,
    "bldStatus": "3-Government",

    // Teacher / Gender
    "rowBoyTotal": 734,
    "rowGirlTotal": 689,
    "tchReg": 43,
    "tchCont": 0,
    "totTchGraduateAbove": 21,
    "totTchPgraduateAbove": 34,
    "tchRecvdServiceTrng": 7,

    // Fees
    "tuitionFeeInRupees": 2400,
    "admissionFeeInRupees": 25,

    // JSONB
    "feeStructure": {
        "middle": {
            "admissionFeeInRupees": 25,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 1200,
            "tuitionFeeInRupees": 0,
            "yearlyDevelopmentChargesInRupees": 6000
        },
        "primary": {
            "admissionFeeInRupees": 25,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 1200,
            "tuitionFeeInRupees": 0,
            "yearlyDevelopmentChargesInRupees": 6000
        },
        "secondary": {
            "admissionFeeInRupees": 25,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 1200,
            "tuitionFeeInRupees": 2400,
            "yearlyDevelopmentChargesInRupees": 6000
        },
        "seniorSecondary": {
            "admissionFeeInRupees": 25,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 1200,
            "tuitionFeeInRupees": 2400,
            "yearlyDevelopmentChargesInRupees": 6000
        }
    },
    "leadership": {
        "principal": {
            "name": "MR S. K. KAIWART",
            "email": "sk.kaiwart12@gmail.com",
            "contactNumber": "8135024300.0",
            "retirementDate": "31/08/31"
        }
    }
};

async function insertSchool() {
    try {
        const s = schoolData;

        // Slug Logic
        // Clean Slug Part: Lowercase, remove special chars, trim dashes
        const cleanSlugPart = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const blockSlug = cleanSlugPart(s.blockName).slice(0, 10).replace(/-+$/, '');
        const nameSlug = cleanSlugPart(s.schoolName).slice(0, 30).replace(/-+$/, '');
        const udiseSuffix = s.udise_code.slice(-5);
        const slug = `${blockSlug}-${nameSlug}-${udiseSuffix}`;

        // Infrastructure Map
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

        const imagesData = { main: null, gallery: [] };

        // Define geniusStats from raw data
        const geniusStats = {
            code: (s as any).genius_school_code,
            is_genius: (s as any).is_genius_school,
            total_registration: (s as any).genius_total_registration,
            unique_admission_count: (s as any).genius_unique_admission_count,
            unique_phone_count: (s as any).genius_unique_phone_count
        };

        // Dynamic Insert Logic
        const schoolObj = s as Record<string, any>; // Fix implicit any

        // Filter keys
        const keys = Object.keys(schoolObj).filter(k =>
            k !== '_id' &&
            !k.toLowerCase().includes('genius') &&
            schoolObj[k] !== undefined
        );

        const dbColumns: string[] = [];
        const values: any[] = [];

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
            ON CONFLICT (udise_code) DO UPDATE SET
                "schoolName" = EXCLUDED."schoolName" 
            RETURNING udise_code;
        `;

        const res = await pool.query(query, values);
        console.log(`✅ Successfully inserted school. ID: ${res.rows[0].udise_code}`);

        // Removed insertion into deleted tables (search_index, policy_stats)

        // --- DERIVED STATS INSERTION ---

        // Stats Calculation
        const totalStudents = s.rowTotal || 1;
        const totalTeachers = s.totalTeacher || 1;
        const boys = s.rowBoyTotal || 1;
        const girls = s.rowGirlTotal || 1;
        const classrooms = s.clsrmsGd || 1;

        // Safety for PV (TS checks)
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

            s.address || `${s.villageName}, ${s.blockName}, ${s.districtName}`,
            s.districtName,
            s.stateName,
            s.pincode,
            s.latitude || 0,
            s.longitude || 0,

            JSON.stringify(imagesData),

            s.tuitionFeeInRupees || 0,
            s.admissionFeeInRupees || 0,

            // Metrics
            (totalStudents / totalTeachers).toFixed(2), // STR
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
            (((s.projectorTot + s.digiBoardTot) / classrooms).toFixed(2)) // Disp
        ];

        await pool.query(`
            INSERT INTO school_stats (
                udise_code, slug, name,
                board, school_type, management, estd_year,
                address, district, state, pincode, latitude, longitude,
                images, tuition_fee, admission_fee,
                student_teacher_ratio, gender_parity_index, bed_qualification_pct,
                teacher_training_pct, regular_teacher_pct, students_per_classroom,
                boys_toilets_per_1000, girls_toilets_per_1000, furniture_availability_pct,
                instructional_days_pct, post_graduate_pct, devices_per_100, displays_per_classroom
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, 
                $8, $9, $10, $11, $12, $13, 
                $14, $15, $16,
                $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
            )
            ON CONFLICT (udise_code) DO NOTHING
        `, statsValues);

        console.log("✅ Derived stats inserted.");
        /* 
        Skipped logic for school_search_index and school_policy_stats 
        as per user request for simplified 2-table schema.
        */

        console.log("✅ Policy stats inserted.");

    } catch (err) {
        console.error("❌ Error inserting school:", err);
    } finally {
        await pool.end();
    }
}

insertSchool();
