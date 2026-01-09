-- Dump 5 records from PROD to STAGING

-- Clean Staging Tables
TRUNCATE TABLE schools_staging;
TRUNCATE TABLE school_stats_staging;

-- Copy 5 records to schools_staging
INSERT INTO schools_staging 
SELECT * FROM schools 
LIMIT 5;

-- Copy 5 matching records to school_stats_staging
-- (Ideally ensuring they match the PKs above)
INSERT INTO school_stats_staging 
SELECT * FROM school_stats 
WHERE udise_code IN (SELECT udise_code FROM schools_staging);

-- Verify
SELECT count(*) as schools_staging_count FROM schools_staging;
SELECT count(*) as stats_staging_count FROM school_stats_staging;
