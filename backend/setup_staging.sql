-- Create Staging Schema
CREATE SCHEMA IF NOT EXISTS staging;

-- 1. Staging Schools Table (Clone of public.schools)
-- Ensure we are copying the NEW structure with raw_data etc.
DROP TABLE IF EXISTS staging.school_policy_stats;
DROP TABLE IF EXISTS staging.school_search_index;
DROP TABLE IF EXISTS staging.schools;

CREATE TABLE IF NOT EXISTS staging.schools (LIKE public.schools INCLUDING ALL);
CREATE TABLE IF NOT EXISTS staging.school_search_index (LIKE public.school_search_index INCLUDING ALL);
CREATE TABLE IF NOT EXISTS staging.school_policy_stats (LIKE public.school_policy_stats INCLUDING ALL);

-- Add Foreign Key constraints for Staging (since LIKE doesn't copy FKs to other schemas automatically implies the target)
-- modifying the FK to point to staging.schools instead of public.schools

ALTER TABLE staging.school_search_index 
DROP CONSTRAINT IF EXISTS school_search_index_school_id_fkey,
ADD CONSTRAINT school_search_index_school_id_fkey 
    FOREIGN KEY (school_id) REFERENCES staging.schools(id) ON DELETE CASCADE;

ALTER TABLE staging.school_policy_stats 
DROP CONSTRAINT IF EXISTS school_policy_stats_school_db_id_fkey,
ADD CONSTRAINT school_policy_stats_school_db_id_fkey 
    FOREIGN KEY (school_db_id) REFERENCES staging.schools(id) ON DELETE CASCADE;

-- Insert a sample row into staging (Minimal Data)
INSERT INTO staging.schools 
SELECT * FROM public.schools LIMIT 1;

-- Insert related stats/index if they exist for that sample
INSERT INTO staging.school_search_index
SELECT * FROM public.school_search_index WHERE school_id = (SELECT id FROM staging.schools LIMIT 1);

INSERT INTO staging.school_policy_stats
SELECT * FROM public.school_policy_stats WHERE school_db_id = (SELECT id FROM staging.schools LIMIT 1);
