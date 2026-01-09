import fs from 'fs';
import path from 'path';

// Sample object provided by user (truncated for brevity in prompt, but I will use the set of keys derived from this + BATHIDNA)
const sampleRealSchool = {
    "udiseschCode": "******04202",
    "schoolName": "RAILWAY HIGH SCHOOL HUBBALLI",
    "schoolId": 5507628,
    "pincode": 580020,
    "schCategoryId": 6,
    "schType": 3,
    "schMgmtId": 95,
    "schMgmtDesc": "Railway School",
    "classFrm": 1,
    "classTo": 10,
    "schoolStatus": 0,
    "schoolStatusName": "Operational",
    "stateName": "KARNATAKA",
    "districtName": "DHARWAD",
    "blockName": "HDMC",
    "clusterName": "NAGASHETTIKOPPA HBL",
    "villageName": "WARD NO. 42",
    "email": "rhshubli.1903[at]gmail[dot]com",
    "address": "HUBLI, HDMC, DHARWAD",
    "schCatDesc": "Pr. Up Pr. and Secondary Only",
    "schLocRuralUrban": 2,
    "schLocDesc": "2-Urban",
    "schTypeDesc": "3-Co-ed",
    "schMgmtParentId": 95,
    "schMgmNationalDesc": null,
    "schCategoryType": "Pr. Up Pr. and Secondary Only",
    "schMgmtType": "Railway School",
    "schBroadMgmtId": 1,
    "yearId": 11,
    "yearDesc": "2024-25",
    "lgdurbanlocalbodyId": "251893",
    "lgdurbanlocalbodyName": "Hubballi-Dharwad-Municipal Corporations",
    "lgdwardId": "28080",
    "lgdwardName": "Hubli-Dharwad (M Corp.) - Ward No.42",
    "lgdvillageId": null,
    "lgdvillName": null,
    "lgdpanchayatId": null,
    "lgdvillpanchayatName": null,
    "lgdblockId": "0",
    "lgdblockName": null,
    "lastmodifiedTime": {
        "$date": "2022-12-09T23:39:16.946Z"
    },
    "schmgmtparentId": 95,
    "sessionYear": null,
    "schMgmtDescSt": "Railway School",
    "latitude": 15.354444,
    "longitude": 75.151389,
    "keyFlag": null,
    "pmShriYn": 2,
    "isnewCy": 2,
    "udise_code": "29090604202",
    "anganwadiSGirl": 0,
    "tuitionFeeInRupees": 0,
    "admissionFeeInRupees": 0,
    "fireSafetyYn": 0,
    "slug": "some-slug-value",
    "name": "Some School Name",
    "atal_lab_code": "NA",
    "anganwadiStuB": 0,
    "anganwadiStuG": 0,
    "anganwadiTchTrained": 9,
    "anganwadiYn": 2,
    "anganwadiYnDesc": "2-No",
    "approachRoadYn": 1,
    "approachRoadYnDesc": "1-Yes",
    "boardHighSec": 0,
    "boardHighSecName": "NA",
    "boardSec": 1,
    "boardSecName": "1-CBSE",
    "cceYn": 1,
    "cceYnDesc": "1-Yes",
    "cwsnSchYn": 2,
    "cwsnSchYnDesc": "2-No",
    "estdYear": "1903",
    "headMasterName": "T NAGAPPA",
    "instructionalDays": 0,
    "mediumOfInstrId1": 19,
    "mediumOfInstrId2": 0,
    "mediumOfInstrId3": 0,
    "mediumOfInstrId4": 0,
    "mediumOfInstrName1": "19-English",
    "mediumOfInstrName2": "NA",
    "mediumOfInstrName3": "NA",
    "mediumOfInstrName4": "NA",
    "minorityYn": 2,
    "minorityYnDesc": "2-No",
    "noInspect": 0,
    "noVisitBrc": 0,
    "noVisitCrc": 0,
    "noVisitDis": 0,
    "ppSecDesc": "1-Yes",
    "ppSecYN": 1,
    "recogYearHsec": null,
    "recogYearPri": "1903",
    "recogYearSec": "1903",
    "recogYearUpr": "1903",
    "resiSchDesc": "3-Non Residential",
    "resiSchTypeId": 0,
    "resiSchTypeName": "NA",
    "resiSchYn": 3,
    "respName": "T NAGAPPA",
    "schPhone": "2346236",
    "shiftSchYn": 2,
    "shiftSchYnDesc": "2-No",
    "smcYn": 2,
    "smcYnDesc": "2-No",
    "smdcSmcSameYnDesc": "",
    "smdcYn": 1,
    "smdcYnDesc": "1-Yes",
    "spltrgYnDesc": "",
    "suppMatRecdYnDesc": "",
    "txtbkHsecYnDesc": "",
    "txtbkPriYnDesc": "",
    "txtbkSecYnDesc": "",
    "txtbkUprYnDesc": "",
    "website": "www.railwayhs1903hubli.com",
    "accessDthYn": 1,
    "accessDthYnDesc": "1-Yes",
    "bldBlk": 1,
    "bldBlkTot": 1,
    "bldStatus": "3-Government",
    "bldStatusId": 3,
    "bndryWallTypeId": 1,
    "bndrywallType": "1-Pucca",
    "clsrmsGd": 12,
    "clsrmsGdKuc": 0,
    "clsrmsGdPpu": 0,
    "clsrmsGdTnt": 0,
    "clsrmsInst": 12,
    "clsrmsMaj": 0,
    "clsrmsMajKuc": 0,
    "clsrmsMajPpu": 0,
    "clsrmsMajTnt": 0,
    "clsrmsMin": 0,
    "clsrmsMinKun": 0,
    "clsrmsMinPpu": 0,
    "clsrmsMinTnt": 0,
    "desktopFun": 0,
    "digiBoardTot": 0,
    "drinkWaterYn": 1,
    "drinkWaterYnDesc": "1-Yes",
    "electricityYn": 1,
    "electricityYnDesc": "1-Yes",
    "handrailsYn": 1,
    "handrailsYnDesc": "1-Yes",
    "handwashMealYn": 1,
    "handwashMealYnDesc": "1-Yes",
    "handwashYn": 2,
    "handwashYnDesc": "2-No",
    "hmRoomYn": 1,
    "hmRoomYnDesc": "1-Yes",
    "ictLabYn": 2,
    "ictLabYnDesc": "2-No",
    "integratedLabYn": 1,
    "internetYn": 1,
    "internetYnDesc": "1-Yes",
    "laptopTot": 0,
    "libraryYn": 1,
    "libraryYnDesc": "1-Yes",
    "medchkYn": 1,
    "medchkYnDesc": "1-Yes",
    "othrooms": 10,
    "playgroundYn": 1,
    "playgroundYnDesc": "1-Yes",
    "printerTot": 0,
    "projectorTot": 0,
    "rainHarvestYn": 1,
    "rainHarvestYnDesc": "1-Yes",
    "rampsYn": 1,
    "rampsYnDesc": "1-Yes",
    "solarpanelYn": 2,
    "solarpanelYnDesc": "2-No",
    "stusHvFurnt": 0,
    "tabletsFun": 0,
    "tabletsTot": 0,
    "tinkeringLabYn": 2,
    "toiletYn": 1,
    "toiletb": 4,
    "toiletbCwsnFun": 0,
    "toiletbFun": 4,
    "toiletg": 4,
    "toiletgCwsnFun": 0,
    "toiletgFun": 4,
    "urinalsb": 5,
    "urinalsg": 5,
    "assemblyCd": "2909004",
    "assemblyCdDesc": "HDMC (CENTRAL)",
    "cityDesc": "NA",
    "compF": 7,
    "compM": 5,
    "compT": 0,
    "ftbPr": 2,
    "ftbUpr": 0,
    "highClass": 10,
    "lowClass": 1,
    "municipalityDesc": "NA",
    "panDesc": "NA",
    "parlCdDesc": "",
    "partTimeInstructor": 0,
    "profQual1": 0,
    "profQual10": 0,
    "profQual11": 0,
    "profQual12": 0,
    "profQual2": 1,
    "profQual3": 11,
    "profQual4": 0,
    "profQual5": 0,
    "profQual6": 0,
    "profQual7": 0,
    "profQual8": 0,
    "schCategoryDesc": "6-Pr. Up Pr. and Secondary Only",
    "schLocRU": 2,
    "schMgmtCenterId": 95,
    "schMgmtNationalDesc": "95-Railway School",
    "schMgmtStateDesc": "95-Railway School",
    "schStatusName": "Operational",
    "tchAbove55": 6,
    "tchCat1": 5,
    "tchCat10": 0,
    "tchCat11": 0,
    "tchCat2": 3,
    "tchCat3": 1,
    "tchCat4": 0,
    "tchCat5": 3,
    "tchCat6": 0,
    "tchCat7": 0,
    "tchCat8": 0,
    "tchCont": 4,
    "tchInvlovedNonTchAssign": 0,
    "tchPart": 0,
    "tchRecvdServiceTrng": 0,
    "tchReg": 8,
    "totFemale": 7,
    "totMale": 5,
    "totNr": 0,
    "totTchBelowGraduate": 0,
    "totTchGraduateAbove": 10,
    "totTchPgraduateAbove": 2,
    "totalExpediture": 0,
    "totalGrant": 0,
    "totalTeacher": 12,
    "transptPr": 0,
    "transptUpr": 0,
    "uniformPr": 2,
    "uniformUpr": 0,
    "villWardName": null,
    "col10BoyGirlTot": 22,
    "col10BoyTot": 10,
    "col10GirlTot": 12,
    "col11BoyGirlTot": 0,
    "col11BoyTot": 0,
    "col11GirlTot": 0,
    "col12BoyGirlTot": 0,
    "col12BoyTot": 0,
    "col12GirlTot": 0,
    "col1BoyGirlTot": 24,
    "col1BoyTot": 11,
    "col1GirlTot": 13,
    "col2BoyGirlTot": 14,
    "col2BoyTot": 8,
    "col2GirlTot": 6,
    "col3BoyGirlTot": 28,
    "col3BoyTot": 15,
    "col3GirlTot": 13,
    "col4BoyGirlTot": 25,
    "col4BoyTot": 16,
    "col4GirlTot": 9,
    "col5BoyGirlTot": 31,
    "col5BoyTot": 20,
    "col5GirlTot": 11,
    "col6BoyGirlTot": 26,
    "col6BoyTot": 9,
    "col6GirlTot": 17,
    "col7BoyGirlTot": 24,
    "col7BoyTot": 7,
    "col7GirlTot": 17,
    "col8BoyGirlTot": 21,
    "col8BoyTot": 9,
    "col8GirlTot": 12,
    "col9BoyGirlTot": 21,
    "col9BoyTot": 10,
    "col9GirlTot": 11,
    "colPryBoyGirlTot": 0,
    "colPryBoyTot": 0,
    "colPryGirlTot": 0,
    "enrollmentName": null,
    "finalTotal": 236,
    "rowBoyTotal": 115,
    "rowGirlTotal": 121,
    "rowTotal": 236,
    "board": "State Board",
    "city_name": "Hubli",
    "google_place_id": "ChIJ_bPg8m5X7TkRxzWdI7SF0b4",
    "feeStructure": {
        "middle": {
            "admissionFeeInRupees": 0,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 0,
            "tuitionFeeInRupees": 2000,
            "yearlyDevelopmentChargesInRupees": 4000
        },
        "primary": {
            "admissionFeeInRupees": 0,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 0,
            "tuitionFeeInRupees": 2000,
            "yearlyDevelopmentChargesInRupees": 4000
        },
        "secondary": {
            "admissionFeeInRupees": 0,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 0,
            "tuitionFeeInRupees": 2500,
            "yearlyDevelopmentChargesInRupees": 4500
        },
        "seniorSecondary": {
            "admissionFeeInRupees": 0,
            "annualMonthlyOtherChargesForOtherFacilitiesInRupees": 0,
            "tuitionFeeInRupees": 0,
            "yearlyDevelopmentChargesInRupees": 0
        }
    },
    "leadership": {
        "emergencyContactPerson": {
            "contactNumber": "9731668606",
            "email": "rhshubli.1903@gmail.com",
            "name": "HEAD MASTER"
        },
        "grievanceComplaintRedressalOfficer": {
            "contactNumber": "9731668606",
            "email": "rhshubli.1903@gmail.com",
            "name": "HEADMASTER"
        },
        "principal": {
            "contactNumber": "9731668606.0",
            "email": "nagappatalwar@gmail.com",
            "name": "MR T NAGAPPA",
            "retirementDate": "31/07/27"
        },
        "sexualHarassmentCommitteeHead": {
            "contactNumber": "9731668600",
            "email": "rhshubli.1903@gmail.com",
            "name": "PRASHANT MASTIHOLI"
        },
        "wellnessActivityTeacher": {
            "available": "NO"
        }
    }
};

const BATHIDNA_PATH = path.join(__dirname, '../BATHIDNA.json');

function getPostgresType(key: string, value: any): string {
    if (key === 'udise_code' || key === 'udiseschCode') return 'VARCHAR(50)';
    if (key === 'schoolId') return 'BIGINT'; // Secondary Key
    if (key === 'feeStructure' || key === 'leadership') return 'JSONB';

    if (typeof value === 'number') {
        return Number.isInteger(value) ? 'INTEGER' : 'DECIMAL(10, 6)';
    }
    if (typeof value === 'boolean') return 'BOOLEAN';
    if (typeof value === 'object' && value !== null) return 'JSONB'; // Fallback for nested
    return 'TEXT';
}

function normalizeKey(key: string): string {
    // Keep camelCase if user wants, or snake_case? 
    // User provided keys like "udiseschCode" in the prompt sample.
    // To match the requirements exactly, we should use the exact keys but maybe sanatize for SQL.
    // Postgres is case-insensitive unless quoted. Quoting 270 columns is painful but safe.
    // Let's use snake_case for DB columns to be standard, OR keep keys as is and quote them.
    // Given the prompt "it should have only the field mentioned in the mongo oject", 
    // keeping exact keys is safer for 1:1 mapping.
    return `"${key}"`;
}

function generate() {
    let allKeys = new Map<string, string>(); // Key -> Type

    // 1. Process Sample Request Data
    for (const [k, v] of Object.entries(sampleRealSchool)) {
        if (k === '_id' || k.toLowerCase().includes('genius')) continue;
        allKeys.set(k, getPostgresType(k, v));
    }

    // 2. Process BATHIDNA for extra keys
    if (fs.existsSync(BATHIDNA_PATH)) {
        const data = JSON.parse(fs.readFileSync(BATHIDNA_PATH, 'utf8'));
        // Scan ALL schools to get superset of keys
        let i = 0;
        for (const school of data) {
            for (const [k, v] of Object.entries(school)) {
                if (k === '_id' || k.toLowerCase().includes('genius')) continue;
                if (!allKeys.has(k)) {
                    allKeys.set(k, getPostgresType(k, v));
                }
            }
            i++;
        }
        console.log(`Scanned ${i} records from BATHIDNA.json`);
    }

    // 3. Build SQL
    // Primary Key: udise_code.
    // Secondary Key: schoolId.
    // NOTE: 'udiseschCode' vs 'udise_code'. The user sample has BOTH.
    // We should probably coalesce them or prioritize one.
    // The user said "primary key would udise code".
    // Let's ensure 'udise_code' exists.

    // Sort keys for stability
    const sortedKeys = Array.from(allKeys.keys()).sort();

    let sql = `-- Auto-generated Schema for Flattened Schools Table\n`;
    sql += `DROP TABLE IF EXISTS schools_staging CASCADE;\n`;
    sql += `DROP TABLE IF EXISTS schools CASCADE;\n\n`;

    sql += `CREATE TABLE schools (\n`;

    // Explicitly handle PK first
    if (allKeys.has('udise_code')) {
        sql += `    "udise_code" VARCHAR(50) PRIMARY KEY,\n`;
        sortedKeys.splice(sortedKeys.indexOf('udise_code'), 1);
    } else if (allKeys.has('udiseschCode')) {
        // Fallback if udise_code is missing but udiseschCode exists (Bathinda data)
        // User sample has both, but Bathinda might only have udiseschCode.
        // We will make udise_code the standard PK and alias during insert.
        sql += `    "udise_code" VARCHAR(50) PRIMARY KEY,\n`;
    }

    // Columns
    const lines = [];
    for (const key of sortedKeys) {
        if (key === 'udiseschCode') continue; // Skip redundant if we used standard
        const type = allKeys.get(key) || 'TEXT';
        lines.push(`    "${key}" ${type}`);
    }

    // Ensure schoolId is present and indexed?
    // It's in the list.

    sql += lines.join(',\n');
    sql += `\n);\n\n`;

    // Indexes
    sql += `CREATE INDEX idx_schools_schoolid ON schools("schoolId");\n`;

    // Staging
    sql += `CREATE TABLE schools_staging (LIKE schools INCLUDING ALL);\n`;

    // Save
    fs.writeFileSync('schema_flat.sql', sql);
    console.log('✅ Generated schema_flat.sql with ' + (lines.length + 1) + ' columns.');
}

generate();
