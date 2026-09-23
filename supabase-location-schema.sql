-- ============================================================================
-- Mizoram Location Hierarchy - Phase 1
-- 2 Blocks: Thingsulthliah (Aizawl) and Phullen (Saitual)
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS villages CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS districts CASCADE;

-- ============================================================================
-- TABLE: districts
-- ============================================================================
CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'Mizoram',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: blocks
-- ============================================================================
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, district_id)
);

-- ============================================================================
-- TABLE: villages
-- ============================================================================
CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, block_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_blocks_district ON blocks(district_id);
CREATE INDEX idx_villages_block ON villages(block_id);

-- ============================================================================
-- DISABLE RLS
-- ============================================================================
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE villages DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA: 2 Districts
-- ============================================================================
INSERT INTO districts (name, state) VALUES
  ('Aizawl', 'Mizoram'),
  ('Saitual', 'Mizoram');

-- ============================================================================
-- SEED DATA: 2 Blocks
-- ============================================================================
-- Thingsulthliah block under Aizawl district
INSERT INTO blocks (name, district_id) VALUES
  ('Thingsulthliah', (SELECT id FROM districts WHERE name = 'Aizawl'));

-- Phullen block under Saitual district
INSERT INTO blocks (name, district_id) VALUES
  ('Phullen', (SELECT id FROM districts WHERE name = 'Saitual'));

-- ============================================================================
-- SEED DATA: Thingsulthliah Block - 10 Villages
-- ============================================================================
INSERT INTO villages (name, block_id) VALUES
  ('Darlawng', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Phulmawi', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Seling', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Sesawng I', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Sesawng II', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Sesawng III', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Thingsulthliah - I', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Thingsulthliah II', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Tlangnuam', (SELECT id FROM blocks WHERE name = 'Thingsulthliah')),
  ('Tlungvel', (SELECT id FROM blocks WHERE name = 'Thingsulthliah'));

-- ============================================================================
-- SEED DATA: Phullen Block - 19 Villages
-- ============================================================================
INSERT INTO villages (name, block_id) VALUES
  ('Buhban', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Dilkhan', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Keifang Leitan', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Keifang Venghlun', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Keifang Venglai', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Khanpui', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Lailak', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Lenchim', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Lungpher', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Maite', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Mualpheng', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Ruallung', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Rulchawm', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Saitual Venglai', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Saitual-I', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Saitual-III', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Sihfa', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Tawizo', (SELECT id FROM blocks WHERE name = 'Phullen')),
  ('Tualbung', (SELECT id FROM blocks WHERE name = 'Phullen'));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the data:

-- Check districts
SELECT * FROM districts;

-- Check blocks with district names
SELECT b.id, b.name AS block_name, d.name AS district_name 
FROM blocks b 
JOIN districts d ON b.district_id = d.id;

-- Check villages with block and district names
SELECT v.id, v.name AS village_name, b.name AS block_name, d.name AS district_name 
FROM villages v 
JOIN blocks b ON v.block_id = b.id 
JOIN districts d ON b.district_id = d.id
ORDER BY d.name, b.name, v.name;

-- Count summary
SELECT 
  (SELECT COUNT(*) FROM districts) AS total_districts,
  (SELECT COUNT(*) FROM blocks) AS total_blocks,
  (SELECT COUNT(*) FROM villages) AS total_villages;
