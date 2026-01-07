-- Enable PostGIS if needed for advanced geo queries (optional for now, using lat/lng)
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    udise_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Location
    address TEXT,
    district VARCHAR(100),
    block VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Classification
    management VARCHAR(100), -- schMgmtDesc
    category VARCHAR(100),   -- schCategoryDesc
    type VARCHAR(50),        -- schTypeDesc (Co-ed, Boys, Girls)
    low_class INTEGER,
    high_class INTEGER,
    estd_year INTEGER,
    
    -- Stats
    total_students INTEGER,
    total_teachers INTEGER,
    student_teacher_ratio DECIMAL(5, 2),
    
    -- Infrastructure (Booleans for easy filtering)
    has_playground BOOLEAN DEFAULT FALSE,
    has_library BOOLEAN DEFAULT FALSE,
    has_computers BOOLEAN DEFAULT FALSE,
    has_internet BOOLEAN DEFAULT FALSE,
    has_smart_class BOOLEAN DEFAULT FALSE,
    
    -- Fees (Stored for sorting/filtering)
    admission_fee INTEGER,  -- from primary/entry level
    tuition_fee INTEGER,    -- from primary/entry level
    
    -- Complex Data
    fee_structure JSONB,   -- Complete struct
    leadership JSONB,      -- Principal, etc
    images JSONB,          -- Array of image URLs
    
    -- Meta
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_schools_district ON schools(district);
CREATE INDEX IF NOT EXISTS idx_schools_pincode ON schools(pincode);
CREATE INDEX IF NOT EXISTS idx_schools_fees ON schools(tuition_fee);
CREATE INDEX IF NOT EXISTS idx_schools_total_students ON schools(total_students);
