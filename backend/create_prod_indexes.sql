-- Production Indexes for Performance Optimization
-- Filters: slug, name, location, metadata

-- Table: schools (Raw Data)
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_district ON schools("districtName");
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools("stateName");

-- Table: school_stats (Derived Data - Heavily Read)
-- already has: udise_code (PK), slug, district, tuition_fee

CREATE INDEX IF NOT EXISTS idx_school_stats_board ON school_stats(board);
CREATE INDEX IF NOT EXISTS idx_school_stats_type ON school_stats(school_type);
CREATE INDEX IF NOT EXISTS idx_school_stats_mgmt ON school_stats(management);
CREATE INDEX IF NOT EXISTS idx_school_stats_pincode ON school_stats(pincode);
CREATE INDEX IF NOT EXISTS idx_school_stats_estd ON school_stats(estd_year);

-- Metrics sorting/filtering
CREATE INDEX IF NOT EXISTS idx_school_stats_str ON school_stats(student_teacher_ratio);
CREATE INDEX IF NOT EXISTS idx_school_stats_rating ON school_stats(gender_parity_index); -- Example metric
