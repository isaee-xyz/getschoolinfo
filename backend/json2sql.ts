
import fs from 'fs';
import { Transform } from 'stream';

// Columns based on schema.sql and seed.ts logic
const SCHOOL_COLS = [
    'udise_code', 'slug', 'name', 'board', 'school_type', 'management', 'estd_year',
    'address', 'district', 'block', 'state', 'pincode', 'latitude', 'longitude',
    'images', 'tuition_fee', 'admission_fee', 'search_vector'
];

const STATS_COLS = [
    'udise_code', 'student_teacher_ratio', 'gender_parity_index',
    'bed_qualification_pct', 'teacher_training_pct', 'regular_teacher_pct',
    'students_per_classroom', 'boys_toilets_per_1000', 'girls_toilets_per_1000',
    'furniture_availability_pct', 'instructional_days_pct', 'post_graduate_pct',
    'devices_per_100', 'displays_per_classroom'
];

// Helper to escape CSV/COPY format
// Postgres COPY text format: defaults to tab delimiter, \N for null
const esc = (val: any) => {
    if (val === null || val === undefined) return '\\N';
    if (typeof val === 'object') return JSON.stringify(val).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    const s = String(val);
    // Escape backslashes, newlines, tabs
    return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
};

const inputFile = process.argv[2];
if (!inputFile) {
    console.error("Usage: ts-node json2sql.ts <file.json>");
    process.exit(1);
}

// Memory-efficient stream processing could be added here, 
// but for now, we'll load the JSON (since GH Action has ~7GB RAM standard)
// to ensure we can join formatting easily.
// If the file is >2GB, we might need a streaming JSON parser.
// Given 35k schools is ~270MB, simple fs read is fine for GitHub Runners.

try {
    const raw = fs.readFileSync(inputFile, 'utf-8');
    const schools = JSON.parse(raw);

    // 1. Output SCHOOLS Data
    console.log(`COPY schools (${SCHOOL_COLS.join(', ')}) FROM stdin;`);
    for (const s of schools) {
        // Data Extraction (Same logic as seed.ts)
        const fees = s.feeStructure?.primary || s.feeStructure?.middle || s.feeStructure?.secondary || {};
        const slug = `${s.district}-${s.schoolName}-${s.udiseCode}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const row = [
            s.udiseCode,
            slug,
            s.schoolName,
            s.schoolBoard,
            s.schoolType,
            s.schoolManagement,
            s.yoe || 1900,
            s.address,
            s.district,
            s.block,
            s.state,
            s.pincode,
            s.lat,
            s.long,
            JSON.stringify({ main: null, gallery: [] }), // images default
            fees.tuitionFeeInRupees || 0,
            fees.admissionFeeInRupees || 0,
            '' // search_vector auto-generated? Or leave null and let DB trigger handle it? DB Trigger updates it. passed as empty string or null?
            // If TSV is generated on Insert, we should pass NULL or rely on trigger. 
            // Standard COPY bypasses rules? No, triggers run if ENABLE TRIGGER ALL.
            // Let's pass \N for search_vector
        ];

        // Fix search vector in array
        row[SCHOOL_COLS.length - 1] = null;

        console.log(row.map(esc).join('\t'));
    }
    console.log('\\.\n');


    // 2. Output STATS Data
    console.log(`COPY school_stats (${STATS_COLS.join(', ')}) FROM stdin;`);
    for (const s of schools) {
        const infra = {
            classrooms_good: s.clsrmsGd,
            classrooms_major_repair: s.clsrmsMaj,
            smart_boards: s.digiBoardTot,
            projectors: s.projectorTot,
            library_books: s.libraryBooks,
            playground: s.playgroundYnDesc?.includes('Yes'),
            computers: (s.desktopFun + s.laptopTot),
            internet: s.internetYnDesc?.includes('Yes'),
            electricity: s.electricityYnDesc?.includes('Yes')
        };

        const row = [
            s.udiseCode,
            s.studTeachRatio || 0,
            s.genderParityIndex || 0,
            s.profQualIdBEd || 0,
            s.tchTraining || 0,
            s.regularTch || 0,
            s.studClsrm || 0,
            s.funcToiletB || 0,
            s.funcToiletG || 0,
            s.furniture || 0,
            s.instDays || 0,
            s.acadQualIdMa || 0,
            s.compAvail || 0,
            0 // displays? derived or 0
        ];
        console.log(row.map(esc).join('\t'));
    }
    console.log('\\.\n');

} catch (e) {
    console.error("Error converting JSON:", e);
    process.exit(1);
}
