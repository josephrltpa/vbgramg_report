# Mizoram Location Hierarchy Setup Guide

## 📍 Overview

This guide explains how to set up the hierarchical location structure (Districts → Blocks → Villages) for Mizoram and test the Excel import functionality.

---

## 🗄️ Step 1: Update Database Schema

### 1.1 Run the Location Schema SQL

Go to your **Supabase SQL Editor** and run the following SQL file:

📄 **File**: `supabase-location-schema.sql`

This will create:
- **districts** table (11 districts of Mizoram)
- **blocks** table (sample blocks for each district)
- **villages** table (sample villages for each block)

### 1.2 Verify the Data

After running the SQL, verify the data was created:

```sql
-- Check districts
SELECT * FROM districts;

-- Check blocks
SELECT b.name AS block_name, d.name AS district_name 
FROM blocks b 
JOIN districts d ON b.district_id = d.id;

-- Check villages
SELECT v.name AS village_name, b.name AS block_name, d.name AS district_name 
FROM villages v 
JOIN blocks b ON v.block_id = b.id 
JOIN districts d ON b.district_id = d.id;
```

You should see:
- 11 districts
- Multiple blocks per district
- Multiple villages per block

---

## 📊 Step 2: Test Excel Import with Sample Data

### 2.1 Sample Files Created

I've created two sample CSV files for testing:

1. **`sample-job-cards-import.csv`**
   - Contains 25 sample job cards
   - Includes District, Block, Village, Job Card Number, Head Name
   - Covers multiple districts and villages

2. **`sample-monthly-demands-import.csv`**
   - Contains 15 sample monthly demands
   - Includes all fields: District, Block, Village, Job Card Number, Head Name, Month, Year, Days Worked, Amount
   - All for April 2025 (month 4)

### 2.2 How to Use the Sample Files

#### Option A: Open in Excel/Google Sheets
1. Open the CSV file in Excel or Google Sheets
2. Review the data structure
3. Save as `.xlsx` format if needed
4. Use the "Import Excel" feature in the app

#### Option B: Direct Import
1. The CSV files can be imported directly (the app supports both `.csv` and `.xlsx`)
2. Go to the app → Select the appropriate tab (JC List or Demands)
3. Click "Import Excel" button
4. Select the CSV file
5. Review the import results

---

## 🧪 Step 3: Test the Import Functionality

### 3.1 Test Job Cards Import

1. **Login as admin** (username: `admin`, password: `admin123`)
2. **Go to JC List tab**
3. **Select a village** from the dropdown (e.g., "Aizawl")
4. **Click "Import Excel"** button
5. **Select** `sample-job-cards-import.csv`
6. **Review the import results**:
   - Should show success count
   - Should show any errors (e.g., duplicate job card numbers)
7. **Verify** the job cards appear in the list

### 3.2 Test Monthly Demands Import

1. **Go to Demands tab**
2. **Select month**: April (4)
3. **Select year**: 2025
4. **Click "Import Excel"** button
5. **Select** `sample-monthly-demands-import.csv`
6. **Review the import results**
7. **Verify** the demands appear in the list with correct amounts

---

## 🔧 Step 4: Update App to Support Hierarchy (Next Phase)

The current app still uses the old flat village structure. To fully support the hierarchy, we need to:

### 4.1 Update Services
- Modify `src/lib/services.ts` to fetch from the new hierarchical tables
- Add functions to fetch districts, blocks, and villages
- Update import functions to handle the new structure

### 4.2 Update UI Components
- Replace single village dropdown with cascading dropdowns:
  - District selector
  - Block selector (filtered by selected district)
  - Village selector (filtered by selected block)
- Update all components that reference village data

### 4.3 Update Excel Import
- Modify import functions to:
  - Accept District, Block, Village columns
  - Validate that the hierarchy exists
  - Create proper relationships

---

## 📝 Current Status

✅ **Completed:**
- Database schema for hierarchical structure
- Sample data for 11 districts with blocks and villages
- Sample CSV files for testing
- Excel import functionality (existing)

⏳ **Next Steps:**
- Update app services to use hierarchical structure
- Update UI to show cascading dropdowns
- Update Excel import to handle hierarchy
- Test with real data from government portal

---

## 💡 Important Notes

1. **Data Validation**: The import will fail if:
   - District/Block/Village doesn't exist in the database
   - Job card number already exists (duplicate)
   - Required fields are missing

2. **Hierarchy Matching**: When importing, the app will:
   - Look up the district by name
   - Look up the block within that district
   - Look up the village within that block
   - Create the job card/demand with proper relationships

3. **Sample Data**: The sample data uses realistic Mizoram village names and follows the MGNREGA job card numbering format: `MZ-{DIST}-{VIL}-{NUM}`

---

## 🚀 Ready to Test?

1. Run the SQL schema in Supabase
2. Download the sample CSV files
3. Test the import functionality
4. Report any issues or errors

Once you've tested with the sample data, we can proceed to update the app to fully support the hierarchical structure!

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console (F12) for error messages
2. Verify the database tables were created correctly
3. Ensure the CSV format matches the expected structure
4. Share any error messages for troubleshooting
