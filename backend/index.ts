import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { initializeFirebase } from './firebase';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const transformSchool = (s: any) => {
  // Extract from raw_data if column doesn't exist on top level (Legacy compat)
  const raw = s.raw_data || {};
  console.log("DEBUG School Keys:", Object.keys(s).filter(k => k.includes('addr') || k.includes('lat') || k.includes('teach')));

  // Flattened schema means 's' has all columns. 
  // We prioritize 's' (row) properties, then fallback to 'raw'.

  const estd_year = s.estd_year || s.estdYear || raw.estdYear;
  const board = s.board || s.boardSecName || raw.boardSecName;
  const management = s.management || s.schMgmtDesc || raw.schMgmtDesc;
  const type = s.type || s.schTypeDesc || raw.schTypeDesc;

  return {
    ...s,
    ...raw, // Merge raw first so explicit s props override

    // ID & Basics
    id: s.id ? s.id.toString() : (s.udise_code ? s.udise_code.toString() : 'unknown'),
    udiseCode: s.udise_code,
    estdYear: estd_year ? estd_year.toString() : null,
    schoolStatusName: s.schoolStatusName || raw.schoolStatusName || "Operational",

    // Location
    // Flattened schema 'schools' has: address, districtName, blockName, stateName, pincode, latitude, longitude
    // Derived schema 'school_stats' has: district, block, state
    // We prefer the 'stats' casing if available (proper title case usually), or raw.
    address: s.address || raw.address,
    district: s.district || s.districtName || raw.districtName || raw.district,
    block: s.block || s.blockName || raw.blockName || raw.block,
    state: s.state || s.stateName || raw.stateName || raw.state,
    pincode: s.pincode || raw.pincode,
    latitude: s.latitude || raw.latitude,
    longitude: s.longitude || raw.longitude,
    lat: s.latitude || raw.latitude, // Frontend expects 'lat'
    lng: s.longitude || raw.longitude, // Frontend expects 'lng'

    // Classification
    boardSecName: board,
    schTypeDesc: type,
    schMgmtDesc: management,

    // Infrastructure - Map from 's' (Flattened) or 'raw'
    clsrmsGd: s.clsrmsGd || raw.clsrmsGd || 0,
    clsrmsMaj: s.clsrmsMaj || raw.clsrmsMaj || 0,
    digiBoardTot: s.digiBoardTot || raw.digiBoardTot || 0,
    projectorTot: s.projectorTot || raw.projectorTot || 0,
    desktopFun: s.desktopFun || raw.desktopFun || 0,
    laptopTot: s.laptopTot || raw.laptopTot || 0,

    // Booleans -> Strings ("1-Yes"/"2-No") if flattened cols are integers
    // or strings if legacy. Flattened schema has integer checks for Y/N?
    // Checking schema: libraryYnDesc is TEXT. libraryYn is INTEGER.
    libraryYnDesc: s.libraryYnDesc || raw.libraryYnDesc || (s.libraryYn === 1 ? "1-Yes" : "2-No"),
    playgroundYnDesc: s.playgroundYnDesc || raw.playgroundYnDesc || (s.playgroundYn === 1 ? "1-Yes" : "2-No"),
    internetYnDesc: s.internetYnDesc || raw.internetYnDesc || (s.internetYn === 1 ? "1-Yes" : "2-No"),
    electricityYnDesc: s.electricityYnDesc || raw.electricityYnDesc || (s.electricityYn === 1 ? "1-Yes" : "2-No"),
    drinkWaterYnDesc: s.drinkWaterYnDesc || raw.drinkWaterYnDesc || (s.drinkWaterYn === 1 ? "1-Yes" : "2-No"),

    // Legacy Specifics
    bldStatus: s.bldStatus || raw.bldStatus || "Private",
    bndrywallType: s.bndrywallType || raw.bndrywallType || "Pucca",
    rampsYn: s.rampsYn ?? raw.rampsYn ?? 0,
    fireSafetyYn: s.fireSafetyYn ?? raw.fireSafetyYn ?? 0,

    // Stats
    totalTeacher: s.totalTeacher || raw.totalTeacher || 0,
    rowTotal: s.rowTotal || raw.rowTotal || 0,
    stusHvFurnt: s.stusHvFurnt || raw.stusHvFurnt || 0,

    // Gender/Teacher Details
    rowGirlTotal: s.rowGirlTotal || raw.rowGirlTotal || 0,
    rowBoyTotal: s.rowBoyTotal || raw.rowBoyTotal || 0,

    tchReg: s.tchReg || raw.tchReg || 0,
    tchCont: s.tchCont || raw.tchCont || 0,
    totTchPgraduateAbove: s.totTchPgraduateAbove || raw.totTchPgraduateAbove || 0,
    totTchGraduateAbove: s.totTchGraduateAbove || raw.totTchGraduateAbove || 0,
    tchRecvdServiceTrng: s.tchRecvdServiceTrng || raw.tchRecvdServiceTrng || 0,

    // Toilets
    toiletbFun: s.toiletbFun || raw.toiletbFun || 0,
    toiletgFun: s.toiletgFun || raw.toiletgFun || 0,

    // Fees
    tuitionFeeInRupees: s.tuition_fee || s.tuitionFeeInRupees || raw.tuitionFeeInRupees || 0,
    admissionFeeInRupees: s.admission_fee || s.admissionFeeInRupees || raw.admissionFeeInRupees || 0,

    // Pre-computed Metrics (from school_stats)
    student_teacher_ratio: Number(s.student_teacher_ratio || raw.student_teacher_ratio || 0),
    students_per_classroom: Number(s.students_per_classroom || raw.students_per_classroom || 0),
    girls_toilets_per_1000: Number(s.girls_toilets_per_1000 || raw.girls_toilets_per_1000 || 0),
    boys_toilets_per_1000: Number(s.boys_toilets_per_1000 || raw.boys_toilets_per_1000 || 0),
    teacher_training_pct: Number(s.teacher_training_pct || raw.teacher_training_pct || 0),
    instructional_days_pct: Number(s.instructional_days_pct || raw.instructional_days_pct || 0),

    // Image
    image: s.images?.main || (raw.images?.main) || null
  };
};

// Helper to get table names based on environment
const getTables = () => {
  // const isStaging = process.env.IS_STAGING === 'true';
  // TEMPORARY: Use Prod DB tables for staging as requested
  return {
    statsTable: 'school_stats', // isStaging ? 'school_stats_staging' : 'school_stats',
    rawTable: 'schools' // isStaging ? 'schools_staging' : 'schools'
  };
};

// Routes
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check
 *     tags: [System]
 *     description: Returns the current status of the API and the active environment (staging/production).
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: 'ok' }
 *                 timestamp: { type: string, format: 'date-time' }
 *                 env: { type: string, example: 'production' }
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    env: process.env.IS_STAGING === 'true' ? 'staging' : 'production'
  });
});

/**
 * @swagger
 * /api/schools:
 *   get:
 *     summary: Retrieve a list of schools
 *     tags: [Schools]
 *     description: Fetch a paginated, filterable list of schools. Returns lightweight objects optimized for list views.
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district name (case-sensitive)
 *         example: Bathinda
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state name
 *         example: Punjab
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial text search on school name
 *         example: model school
 *     responses:
 *       200:
 *         description: A refined list of schools matching the criteria.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/School'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/schools', async (req, res) => {
  try {
    const { statsTable } = getTables();
    const { district, state, search, sort } = req.query;

    let query = `SELECT * FROM ${statsTable}`;
    const values: any[] = [];
    const conditions: string[] = [];

    if (district) {
      values.push(district);
      conditions.push(`district = $${values.length}`);
    }
    if (state) {
      values.push(state);
      conditions.push(`state = $${values.length}`);
    }
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`name ILIKE $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Sorting Logic
    if (sort === 'academic') {
      // Prioritize Teacher Training (High) and STR (Low but > 0)
      query += ` ORDER BY teacher_training_pct DESC NULLS LAST, student_teacher_ratio ASC NULLS LAST`;
    } else {
      query += ` ORDER BY name ASC`;
    }

    query += ` LIMIT 1000`; // Limit for performance

    const result = await pool.query(query, values);

    // Only minimal transformation needed as DB columns now match desired structure
    // But we still need to match the frontend 'School' interface
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * @swagger
 * /api/school/{slug}:
 *   get:
 *     summary: Get detailed profile of a specific school
 *     tags: [Schools]
 *     description: Retrieves the complete dataset for a school, including raw UDISE data, infrastructure details, and calculated metrics.
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The SEO-friendly slug or the school's UDISE code
 *         example: govt-high-school-bathinda-030101
 *     responses:
 *       200:
 *         description: Detailed school profile found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/School'
 *       404:
 *         description: School not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/api/school/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const { statsTable, rawTable } = getTables();

    // Try matching by slug first
    // Join with school_stats to ensure we get both raw details and calculated metrics
    let result = await pool.query(`
      SELECT s.*, ss.*
      FROM ${rawTable} s
      JOIN ${statsTable} ss ON s.udise_code = ss.udise_code
      WHERE ss.slug = $1
    `, [slug]);

    // Fallback
    if (result.rows.length === 0 && !isNaN(Number(slug))) {
      result = await pool.query(`
        SELECT s.*, ss.*
        FROM ${rawTable} s
        JOIN ${statsTable} ss ON s.udise_code = ss.udise_code
        WHERE s.udise_code = $1
      `, [slug]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(transformSchool(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Config/Metadata Endpoint
/**
 * @swagger
 * /api/config/locations:
 *   get:
 *     summary: Fetch available location filters
 *     tags: [Configuration]
 *     description: Returns a list of unique states and districts present in the database to populate UI filters.
 *     responses:
 *       200:
 *         description: Location metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 districts:
 *                   type: array
 *                   items: { type: string, example: 'Bathinda' }
 *                 states:
 *                   type: array
 *                   items: { type: string, example: 'Punjab' }
 */
app.get('/api/config/locations', async (req, res) => {
  try {
    const { statsTable } = getTables();
    const { district } = req.query;

    if (district) {
      // Fetch blocks for a specific district from stats table
      const result = await pool.query(`
        SELECT DISTINCT block 
        FROM ${statsTable} 
        WHERE (district = $1 OR district ILIKE $1) AND block IS NOT NULL 
        ORDER BY block ASC
      `, [district]);

      return res.json({
        blocks: result.rows.map(r => r.block)
      });
    }

    // Default: Fetch all states and districts
    const result = await pool.query(`
      SELECT DISTINCT district, state 
      FROM ${statsTable} 
      WHERE district IS NOT NULL 
      ORDER BY district ASC
    `);

    const locations = {
      districts: [...new Set(result.rows.map(r => r.district))],
      states: [...new Set(result.rows.map(r => r.state))]
    };

    res.json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ error: 'Failed to fetch location config' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
