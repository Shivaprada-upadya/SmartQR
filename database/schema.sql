-- ==========================================
-- SmartQR Database Schema
-- PostgreSQL 17
-- ==========================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0)
);

-- Case-insensitive unique email addresses
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
ON users (LOWER(email));


-- 2. QR CODES
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(150) NOT NULL,

    destination TEXT NOT NULL,

    qr_type VARCHAR(20) NOT NULL DEFAULT 'static',

    short_code VARCHAR(20) UNIQUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_qr_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT qr_type_valid
        CHECK (qr_type IN ('static', 'dynamic')),

    CONSTRAINT qr_short_code_valid
        CHECK (
            (qr_type = 'dynamic' AND short_code IS NOT NULL)
            OR
            (qr_type = 'static' AND short_code IS NULL)
        ),

    CONSTRAINT qr_title_not_empty
        CHECK (LENGTH(TRIM(title)) > 0),

    CONSTRAINT qr_destination_not_empty
        CHECK (LENGTH(TRIM(destination)) > 0)
);

-- Speeds up user QR listing
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_created
ON qr_codes (user_id, created_at DESC);

-- Speeds up active QR lookups
CREATE INDEX IF NOT EXISTS idx_qr_codes_active
ON qr_codes (is_active);


-- 3. QR SCANS
CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    qr_code_id UUID NOT NULL,

    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    device_type VARCHAR(30) DEFAULT 'unknown',

    browser VARCHAR(100),

    operating_system VARCHAR(100),

    referrer TEXT,

    CONSTRAINT fk_scan_qr
        FOREIGN KEY (qr_code_id)
        REFERENCES qr_codes(id)
        ON DELETE CASCADE,

    CONSTRAINT scan_device_valid
        CHECK (
            device_type IN (
                'mobile',
                'desktop',
                'tablet',
                'unknown'
            )
        )
);

-- Speeds up scan analytics
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_date
ON qr_scans (qr_code_id, scanned_at DESC);


-- ==========================================
-- Schema creation completed
-- ==========================================
