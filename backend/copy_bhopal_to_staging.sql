-- Copy 10 schools from Bhopal to Staging

-- 1. Insert into schools_staging (Raw Data)
INSERT INTO schools_staging
SELECT * FROM schools 
WHERE udise_code IN (
    SELECT udise_code FROM school_stats WHERE district ILIKE 'Bhopal' ORDER BY udise_code LIMIT 10
)
ON CONFLICT (udise_code) DO NOTHING;

-- 2. Insert into school_stats_staging (Optimized Data)
INSERT INTO school_stats_staging
SELECT * FROM school_stats 
WHERE district ILIKE 'Bhopal' 
ORDER BY udise_code 
LIMIT 10
ON CONFLICT (udise_code) DO NOTHING;
