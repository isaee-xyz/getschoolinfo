"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var pg_1 = require("pg");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'school_db_dev',
    port: parseInt(process.env.DB_PORT || '5432'),
});
// Robust path resolution regardless of CJS/ESM
var DATA_FILE = path_1.default.join(process.cwd(), "../".concat(process.argv[2] || 'BATHIDNA.json'));
var SCHEMA_FILE = path_1.default.join(process.cwd(), 'schema.sql');
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var schemaSql, rawData, schools, successCount, _loop_1, _i, schools_1, s, err_1;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    _l.trys.push([0, 7, 8, 10]);
                    console.log("\uD83C\uDF31 Starting seed process using ".concat(process.argv[2] || 'BATHIDNA.json', "..."));
                    if (!!process.argv[2]) return [3 /*break*/, 2];
                    schemaSql = fs_1.default.readFileSync(SCHEMA_FILE, 'utf8');
                    return [4 /*yield*/, pool.query(schemaSql)];
                case 1:
                    _l.sent();
                    console.log('✅ Schema applied.');
                    _l.label = 2;
                case 2:
                    // 2. Read Data
                    if (!fs_1.default.existsSync(DATA_FILE)) {
                        console.error("\u274C Data file not found: ".concat(DATA_FILE));
                        process.exit(1);
                    }
                    rawData = fs_1.default.readFileSync(DATA_FILE, 'utf8');
                    schools = JSON.parse(rawData);
                    console.log("\uD83D\uDCCA Found ".concat(schools.length, " schools to import."));
                    successCount = 0;
                    _loop_1 = function (s) {
                        var fees, tuition, admission, hasPlayground, hasLibrary, hasInternet, hasComputers, hasSmartClass, infraDetails, teacherDetails, imagesData, cleanSlugPart, blockSlug, nameSlug, udiseRaw, udiseSuffix, slug, schoolObj_1, keys, dbColumns, values, finalUdiseCode, _m, keys_1, k, val, placeholders, columnsStr, query, str, totalStudents, totalTeachers, boys, girls, classrooms, profQual3, instructionalDays, stusHvFurnt, tablets, statsValues, err_2;
                        return __generator(this, function (_o) {
                            switch (_o.label) {
                                case 0:
                                    _o.trys.push([0, 3, , 4]);
                                    fees = ((_a = s.feeStructure) === null || _a === void 0 ? void 0 : _a.primary) || ((_b = s.feeStructure) === null || _b === void 0 ? void 0 : _b.middle) || ((_c = s.feeStructure) === null || _c === void 0 ? void 0 : _c.secondary) || {};
                                    tuition = fees.tuitionFeeInRupees || 0;
                                    admission = fees.admissionFeeInRupees || 0;
                                    hasPlayground = ((_d = s.playgroundYnDesc) === null || _d === void 0 ? void 0 : _d.includes('Yes')) || false;
                                    hasLibrary = ((_e = s.libraryYnDesc) === null || _e === void 0 ? void 0 : _e.includes('Yes')) || false;
                                    hasInternet = ((_f = s.internetYnDesc) === null || _f === void 0 ? void 0 : _f.includes('Yes')) || false;
                                    hasComputers = (s.desktopFun + s.laptopTot) > 0;
                                    hasSmartClass = s.digiBoardTot > 0;
                                    infraDetails = {
                                        classrooms_good: s.clsrmsGd,
                                        classrooms_major_repair: s.clsrmsMaj,
                                        smart_boards: s.digiBoardTot,
                                        projectors: s.projectorTot,
                                        computers: s.desktopFun + s.laptopTot,
                                        toilets_boys: s.toiletbFun,
                                        toilets_girls: s.toiletgFun,
                                        drinking_water: (_g = s.drinkWaterYnDesc) === null || _g === void 0 ? void 0 : _g.includes('Yes'),
                                        electricity: (_h = s.electricityYnDesc) === null || _h === void 0 ? void 0 : _h.includes('Yes'),
                                        library: (_j = s.libraryYnDesc) === null || _j === void 0 ? void 0 : _j.includes('Yes'),
                                        playground: (_k = s.playgroundYnDesc) === null || _k === void 0 ? void 0 : _k.includes('Yes'),
                                        // New fields for legacy frontend support
                                        boundary_wall_type: s.bndrywallType,
                                        ramps: s.rampsYn,
                                        fire_safety: s.fireSafetyYn,
                                        building_status: s.bldStatus
                                    };
                                    teacherDetails = {
                                        total: s.totalTeacher,
                                        regular: s.tchReg,
                                        contract: s.tchCont,
                                        graduate_above: s.totTchGraduateAbove,
                                        post_graduate_above: s.totTchPgraduateAbove,
                                        trained: s.tchRecvdServiceTrng
                                    };
                                    imagesData = {
                                        main: null, // Placeholder for future logic
                                        gallery: []
                                    };
                                    cleanSlugPart = function (str) { return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); };
                                    blockSlug = cleanSlugPart(s.blockName).slice(0, 10).replace(/-+$/, '');
                                    nameSlug = cleanSlugPart(s.schoolName).slice(0, 30).replace(/-+$/, '');
                                    udiseRaw = (s.udise_code || s.udiseschCode || '00000').toString();
                                    udiseSuffix = udiseRaw.length > 5 ? udiseRaw.slice(-5) : udiseRaw;
                                    slug = "".concat(blockSlug, "-").concat(nameSlug, "-").concat(udiseSuffix);
                                    schoolObj_1 = s;
                                    keys = Object.keys(schoolObj_1).filter(function (k) {
                                        return k !== '_id' &&
                                            !k.toLowerCase().includes('genius') &&
                                            schoolObj_1[k] !== undefined;
                                    });
                                    dbColumns = [];
                                    values = [];
                                    finalUdiseCode = schoolObj_1.udise_code || schoolObj_1.udiseschCode;
                                    for (_m = 0, keys_1 = keys; _m < keys_1.length; _m++) {
                                        k = keys_1[_m];
                                        if (k === 'udise_code' || k === 'udiseschCode')
                                            continue; // Handle PK separate
                                        dbColumns.push("\"".concat(k, "\""));
                                        val = schoolObj_1[k];
                                        if (typeof val === 'object' && val !== null) {
                                            val = JSON.stringify(val);
                                        }
                                        values.push(val);
                                    }
                                    // Add PK
                                    dbColumns.unshift('"udise_code"');
                                    values.unshift(finalUdiseCode);
                                    placeholders = values.map(function (_, idx) { return "$".concat(idx + 1); }).join(', ');
                                    columnsStr = dbColumns.join(', ');
                                    query = "\n                    INSERT INTO schools (".concat(columnsStr, ") \n                    VALUES (").concat(placeholders, ")\n                    ON CONFLICT (udise_code) DO NOTHING\n                    RETURNING udise_code;\n                ");
                                    return [4 /*yield*/, pool.query(query, values)];
                                case 1:
                                    _o.sent();
                                    str = s.totalTeacher > 0 ? (s.rowTotal / s.totalTeacher).toFixed(2) : 0;
                                    totalStudents = s.rowTotal || 1;
                                    totalTeachers = s.totalTeacher || 1;
                                    boys = s.rowBoyTotal || 1;
                                    girls = s.rowGirlTotal || 1;
                                    classrooms = s.clsrmsGd || 1;
                                    profQual3 = s.profQual3 || 0;
                                    instructionalDays = s.instructionalDays || 0;
                                    stusHvFurnt = s.stusHvFurnt || 0;
                                    tablets = s.tabletsFun || 0;
                                    statsValues = [
                                        finalUdiseCode,
                                        slug,
                                        s.schoolName,
                                        s.boardSecName || 'NA',
                                        s.schTypeDesc || 'NA',
                                        s.schMgmtDesc || 'NA',
                                        parseInt(s.estdYear) || null,
                                        s.address || "".concat(s.village, ", ").concat(s.blockName, ", ").concat(s.districtName),
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
                                    return [4 /*yield*/, pool.query("\n                    INSERT INTO school_stats (\n                        udise_code, slug, name,\n                        board, school_type, management, estd_year,\n                        address, district, block, state, pincode, latitude, longitude,\n                        images, tuition_fee, admission_fee,\n                        student_teacher_ratio, gender_parity_index, bed_qualification_pct,\n                        teacher_training_pct, regular_teacher_pct, students_per_classroom,\n                        boys_toilets_per_1000, girls_toilets_per_1000, furniture_availability_pct,\n                        instructional_days_pct, post_graduate_pct, devices_per_100, displays_per_classroom\n                    ) VALUES (\n                        $1, $2, $3, $4, $5, $6, $7, \n                        $8, $9, $30, $10, $11, $12, $13, \n                        $14, $15, $16,\n                        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29\n                    )\n                    ON CONFLICT (udise_code) DO NOTHING\n                ", statsValues)];
                                case 2:
                                    _o.sent();
                                    successCount++;
                                    if (successCount % 100 === 0)
                                        process.stdout.write('.');
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _o.sent();
                                    console.warn("\n\u26A0\uFE0F Failed to insert ".concat(s.schoolName, ": ").concat(err_2));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, schools_1 = schools;
                    _l.label = 3;
                case 3:
                    if (!(_i < schools_1.length)) return [3 /*break*/, 6];
                    s = schools_1[_i];
                    return [5 /*yield**/, _loop_1(s)];
                case 4:
                    _l.sent();
                    _l.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log("\n\u2705 Successfully seeded ".concat(successCount, " schools."));
                    return [3 /*break*/, 10];
                case 7:
                    err_1 = _l.sent();
                    console.error('❌ Seeding failed:', err_1);
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, pool.end()];
                case 9:
                    _l.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
seed();
