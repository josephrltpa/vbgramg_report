-- ============================================================================
-- Mizoram Location Hierarchy Schema
-- Districts → Blocks → Villages
-- ============================================================================

-- Drop existing tables if they exist (be careful with this in production!)
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
-- TABLE: villages (updated structure)
-- ============================================================================
CREATE TABLE villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, block_id)
);

-- ============================================================================
-- INDEXES for faster queries
-- ============================================================================
CREATE INDEX idx_blocks_district ON blocks(district_id);
CREATE INDEX idx_villages_block ON villages(block_id);

-- ============================================================================
-- DISABLE RLS (for testing - enable proper security in production)
-- ============================================================================
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE villages DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SEED DATA: Mizoram's 11 Districts
-- ============================================================================
INSERT INTO districts (name, state) VALUES
  ('Aizawl', 'Mizoram'),
  ('Champhai', 'Mizoram'),
  ('Kolasib', 'Mizoram'),
  ('Lawngtlai', 'Mizoram'),
  ('Lunglei', 'Mizoram'),
  ('Mamit', 'Mizoram'),
  ('Saiha', 'Mizoram'),
  ('Serchhip', 'Mizoram'),
  ('Hnahthial', 'Mizoram'),
  ('Khawzawl', 'Mizoram'),
  ('Saitual', 'Mizoram');

-- ============================================================================
-- SEED DATA: Sample Blocks for each district
-- ============================================================================
-- Aizawl District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Aizawl I', (SELECT id FROM districts WHERE name = 'Aizawl')),
  ('Aizawl II', (SELECT id FROM districts WHERE name = 'Aizawl')),
  ('Aizawl III', (SELECT id FROM districts WHERE name = 'Aizawl')),
  ('Aizawl IV', (SELECT id FROM districts WHERE name = 'Aizawl'));

-- Champhai District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Champhai Rural', (SELECT id FROM districts WHERE name = 'Champhai')),
  ('Khawzawl', (SELECT id FROM districts WHERE name = 'Champhai')),
  ('Khawbung', (SELECT id FROM districts WHERE name = 'Champhai'));

-- Kolasib District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Kolasib Rural', (SELECT id FROM districts WHERE name = 'Kolasib')),
  ('Bilkhawthliri', (SELECT id FROM districts WHERE name = 'Kolasib')),
  ('Thingdawl', (SELECT id FROM districts WHERE name = 'Kolasib'));

-- Lunglei District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Lunglei Rural', (SELECT id FROM districts WHERE name = 'Lunglei')),
  ('Tlabung', (SELECT id FROM districts WHERE name = 'Lunglei')),
  ('Bungtlang South', (SELECT id FROM districts WHERE name = 'Lunglei')),
  ('Lunglei Urban', (SELECT id FROM districts WHERE name = 'Lunglei'));

-- Mamit District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Mamit Rural', (SELECT id FROM districts WHERE name = 'Mamit')),
  ('Tuirial', (SELECT id FROM districts WHERE name = 'Mamit')),
  ('Reiek', (SELECT id FROM districts WHERE name = 'Mamit'));

-- Serchhip District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Serchhip Rural', (SELECT id FROM districts WHERE name = 'Serchhip')),
  ('South Tuipui', (SELECT id FROM districts WHERE name = 'Serchhip'));

-- Lawngtlai District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Lawngtlai Rural', (SELECT id FROM districts WHERE name = 'Lawngtlai')),
  ('Sangau', (SELECT id FROM districts WHERE name = 'Lawngtlai'));

-- Saiha District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Saiha Rural', (SELECT id FROM districts WHERE name = 'Saiha')),
  ('Sajikhowse', (SELECT id FROM districts WHERE name = 'Saiha'));

-- Hnahthial District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Hnahthial Rural', (SELECT id FROM districts WHERE name = 'Hnahthial'));

-- Khawzawl District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Khawzawl Rural', (SELECT id FROM districts WHERE name = 'Khawzawl'));

-- Saitual District Blocks
INSERT INTO blocks (name, district_id) VALUES
  ('Saitual Rural', (SELECT id FROM districts WHERE name = 'Saitual'));

-- ============================================================================
-- SEED DATA: Sample Villages for each block
-- ============================================================================
-- Aizawl I Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Aizawl', (SELECT id FROM blocks WHERE name = 'Aizawl I' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl'))),
  ('Chhingahtlang', (SELECT id FROM blocks WHERE name = 'Aizawl I' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl'))),
  ('Mission Veng', (SELECT id FROM blocks WHERE name = 'Aizawl I' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl'))),
  ('Zarkawt', (SELECT id FROM blocks WHERE name = 'Aizawl I' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl')));

-- Aizawl II Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Sikulpuikawn', (SELECT id FROM blocks WHERE name = 'Aizawl II' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl'))),
  ('Tluang', (SELECT id FROM blocks WHERE name = 'Aizawl II' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl'))),
  ('Dawrpuk Veng', (SELECT id FROM blocks WHERE name = 'Aizawl II' AND district_id = (SELECT id FROM districts WHERE name = 'Aizawl')));

-- Champhai Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Champhai', (SELECT id FROM blocks WHERE name = 'Champhai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Champhai'))),
  ('Zote Veng', (SELECT id FROM blocks WHERE name = 'Champhai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Champhai'))),
  ('Kanghmun', (SELECT id FROM blocks WHERE name = 'Champhai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Champhai')));

-- Lunglei Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Lunglei', (SELECT id FROM blocks WHERE name = 'Lunglei Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lunglei'))),
  ('Mualcheng', (SELECT id FROM blocks WHERE name = 'Lunglei Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lunglei'))),
  ('Ngurban', (SELECT id FROM blocks WHERE name = 'Lunglei Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lunglei')));

-- Kolasib Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Kolasib', (SELECT id FROM blocks WHERE name = 'Kolasib Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Kolasib'))),
  ('Bilkhawthliri', (SELECT id FROM blocks WHERE name = 'Kolasib Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Kolasib'))),
  ('Saireng', (SELECT id FROM blocks WHERE name = 'Kolasib Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Kolasib')));

-- Mamit Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Mamit', (SELECT id FROM blocks WHERE name = 'Mamit Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Mamit'))),
  ('Hmuifang', (SELECT id FROM blocks WHERE name = 'Mamit Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Mamit'))),
  ('Lalbiakzira', (SELECT id FROM blocks WHERE name = 'Mamit Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Mamit')));

-- Serchhip Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Serchhip', (SELECT id FROM blocks WHERE name = 'Serchhip Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Serchhip'))),
  ('Lungsen', (SELECT id FROM blocks WHERE name = 'Serchhip Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Serchhip'))),
  ('Lokhaw', (SELECT id FROM blocks WHERE name = 'Serchhip Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Serchhip')));

-- Lawngtlai Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Lawngtlai', (SELECT id FROM blocks WHERE name = 'Lawngtlai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lawngtlai'))),
  ('Hmarchak', (SELECT id FROM blocks WHERE name = 'Lawngtlai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lawngtlai'))),
  ('Bialkaw', (SELECT id FROM blocks WHERE name = 'Lawngtlai Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Lawngtlai')));

-- Saiha Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Saiha', (SELECT id FROM blocks WHERE name = 'Saiha Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Saiha'))),
  ('Sangau', (SELECT id FROM blocks WHERE name = 'Saiha Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Saiha'))),
  ('Phura', (SELECT id FROM blocks WHERE name = 'Saiha Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Saiha')));

-- Hnahthial Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Hnahthial', (SELECT id FROM blocks WHERE name = 'Hnahthial Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Hnahthial'))),
  ('Zawlnuam', (SELECT id FROM blocks WHERE name = 'Hnahthial Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Hnahthial')));

-- Khawzawl Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Khawzawl', (SELECT id FROM blocks WHERE name = 'Khawzawl Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Khawzawl'))),
  ('Vangchhia', (SELECT id FROM blocks WHERE name = 'Khawzawl Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Khawzawl')));

-- Saitual Rural Block Villages
INSERT INTO villages (name, block_id) VALUES
  ('Saitual', (SELECT id FROM blocks WHERE name = 'Saitual Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Saitual'))),
  ('Champhai Kanghmun', (SELECT id FROM blocks WHERE name = 'Saitual Rural' AND district_id = (SELECT id FROM districts WHERE name = 'Saitual')));
