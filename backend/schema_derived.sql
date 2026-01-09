-- Derived Data Table for Search and Analytics
-- Designed to be lightweight and fast for list views and filtering

DROP TABLE IF EXISTS school_stats_staging CASCADE;
DROP TABLE IF EXISTS school_stats CASCADE;

CREATE TABLE school_stats (
    udise_code VARCHAR(50) PRIMARY KEY, -- FK to schools
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    
    -- Core Search Fields
    board TEXT,
    school_type TEXT, -- e.g., "Co-ed"
    management TEXT, -- e.g., "Private", "Government"
    estd_year INTEGER,
    
    -- Location (Simplified)
    address TEXT,
    district TEXT,
    state TEXT,
    pincode INTEGER,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    
    -- Media (Optimization)
    -- JSONB structure: { "main": "url", "gallery": ["url1", "url2"] }
    images JSONB DEFAULT '{"main": null, "gallery": []}',
    
    -- Fees (Key Filters)
    tuition_fee INTEGER DEFAULT 0,
    admission_fee INTEGER DEFAULT 0,
    
    -- 13 Policy Metrics (Pre-calculated Benchmarks)
    student_teacher_ratio DECIMAL(5, 2),
    gender_parity_index DECIMAL(5, 2),
    bed_qualification_pct DECIMAL(5, 2),
    teacher_training_pct DECIMAL(5, 2),
    regular_teacher_pct DECIMAL(5, 2),
    students_per_classroom DECIMAL(5, 2),
    boys_toilets_per_1000 DECIMAL(5, 2),
    girls_toilets_per_1000 DECIMAL(5, 2),
    furniture_availability_pct DECIMAL(5, 2),
    instructional_days_pct DECIMAL(5, 2),
    post_graduate_pct DECIMAL(5, 2),
    devices_per_100 DECIMAL(5, 2),
    displays_per_classroom DECIMAL(5, 2),
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_school_stats_district ON school_stats(district);
CREATE INDEX idx_school_stats_slug ON school_stats(slug);
CREATE INDEX idx_school_stats_tuition ON school_stats(tuition_fee);

-- Staging Clone
CREATE TABLE school_stats_staging (LIKE school_stats INCLUDING ALL);
