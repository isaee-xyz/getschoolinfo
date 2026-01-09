-- Add block column to school_stats if not exists
ALTER TABLE school_stats ADD COLUMN IF NOT EXISTS block TEXT;
ALTER TABLE school_stats_staging ADD COLUMN IF NOT EXISTS block TEXT;

-- Backfill block data from schools table
UPDATE school_stats ss
SET block = s."blockName"
FROM schools s
WHERE ss.udise_code = s.udise_code
AND ss.block IS NULL;

UPDATE school_stats_staging ss
SET block = s."blockName"
FROM schools_staging s
WHERE ss.udise_code = s.udise_code
AND ss.block IS NULL;
