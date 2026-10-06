# Demand List Upload Feature

## Overview

Added a new feature allowing VEC (Village Employment Committee) users to upload demand list Excel files for each month. Admin users can then download these files and create demands based on them.

## Workflow

### VEC User Flow:
1. Login as VEC secretary (e.g., buhban/vec123)
2. Navigate to Demands tab
3. Select month and year
4. Upload Excel file containing the list of job cards needed for that month
5. File is stored and visible to admin

### Admin Flow:
1. Login as admin (admin/admin123)
2. Select village from dropdown
3. Navigate to Demands tab
4. Select month and year
5. See uploaded demand list from VEC
6. Download the Excel file
7. Create demands based on the uploaded list

## Features

### For VEC Users:
- ✅ Upload Excel file (.xlsx, .xls, .csv)
- ✅ View uploaded file name and upload date
- ✅ Delete uploaded file (if needed)
- ✅ One file per village per month/year
- ✅ Uploading new file replaces the old one

### For Admin Users:
- ✅ View uploaded demand list from VEC
- ✅ Download the Excel file
- ✅ See file name and upload date
- ✅ Message when no file is uploaded

## Database Schema

### Table: `demand_list_files`

```sql
CREATE TABLE demand_list_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  file_link TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(village, month, year)
);
```

### Constraints:
- One file per village per month/year (UNIQUE constraint)
- Month must be between 1-12
- All fields are required

## File Storage

Files are stored in Supabase Storage:
- **Bucket**: `wagelists` (reuses existing bucket)
- **Path**: `demand_lists/{village}/{year}/{month}/demand_list_{village}_{year}_{month}_{timestamp}.{ext}`
- **Example**: `demand_lists/Buhban/2026/9/demand_list_Buhban_2026_9_1727345678901.xlsx`

## API Functions

### Service Functions (src/lib/services.ts):

1. **fetchDemandListFile(village, month, year)**
   - Fetches demand list file metadata for a specific village/month/year
   - Returns `DemandListFile | null`

2. **uploadDemandListFile(village, month, year, fileLink, fileName, uploadedBy)**
   - Creates or updates demand list file record
   - Returns `DemandListFile | null`

3. **deleteDemandListFile(village, month, year)**
   - Deletes demand list file record
   - Returns `boolean`

### Storage Functions (src/lib/storage.ts):

1. **uploadDemandListFileToStorage(file, village, month, year)**
   - Uploads file to Supabase Storage
   - Returns public URL or null

2. **deleteDemandListFileFromStorage(fileUrl)**
   - Deletes file from Supabase Storage
   - Returns boolean

## UI Components

### Demand List Section (in MonthlyDemandModule.tsx):

Located between Summary Cards and Village Wagelist sections.

**For VEC Users:**
- File input (accepts .xlsx, .xls, .csv)
- Upload status indicator
- Current file info (if uploaded)
- Delete button (for current file)
- Helper text explaining the feature

**For Admin Users:**
- Download button (if file exists)
- File info display (name, upload date)
- Message when no file is uploaded

## User Interface

### VEC View:
```
┌─────────────────────────────────────────┐
│ Demand List                             │
│ September 2026 • Buhban                 │
├─────────────────────────────────────────┤
│                                         │
│ [If file uploaded:]                     │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 Demand list uploaded             │ │
│ │ demand_list.xlsx • 9/23/2026   [🗑]│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Choose File] [Uploading...]            │
│                                         │
│ Upload the demand list Excel file for   │
│ this month. Admin will review and       │
│ create demands based on this list.      │
│                                         │
└─────────────────────────────────────────┘
```

### Admin View:
```
┌─────────────────────────────────────────┐
│ Demand List                 [Download]  │
│ September 2026 • Buhban                 │
├─────────────────────────────────────────┤
│                                         │
│ [If file uploaded:]                     │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 Demand list from VEC             │ │
│ │ demand_list.xlsx • 9/23/2026        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [If no file:]                           │
│ No demand list uploaded by VEC for      │
│ this month                              │
│                                         │
└─────────────────────────────────────────┘
```

## Setup Instructions

### 1. Run Database Migration

Execute the SQL in Supabase SQL Editor:

```sql
-- Create demand_list_files table for VEC demand list uploads
CREATE TABLE IF NOT EXISTS demand_list_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  file_link TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(village, month, year)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_demand_list_files_village_month_year 
ON demand_list_files(village, month, year);

-- Disable RLS for now (we can add proper security later)
ALTER TABLE demand_list_files DISABLE ROW LEVEL SECURITY;
```

### 2. Push Code to GitHub

```bash
git add .
git commit -m "Add demand list upload feature for VEC users"
git push
```

### 3. Test the Feature

**As VEC User:**
1. Login as `buhban` / `vec123`
2. Go to Demands tab
3. Select month/year
4. Upload an Excel file
5. Verify file appears with name and date
6. Try deleting and re-uploading

**As Admin:**
1. Login as `admin` / `admin123`
2. Select village (e.g., Buhban)
3. Go to Demands tab
4. Select same month/year
5. Verify you can see the uploaded file
6. Click "Download Demand List"
7. Verify file downloads correctly

## Excel File Format

The uploaded Excel file should contain:
- Job Card Numbers
- Worker Names
- Any other relevant information for the admin

**Note**: The system doesn't validate the Excel content - it's just stored as a file for admin to review.

## Error Handling

### Upload Errors:
- File too large → Supabase Storage limit (1GB free tier)
- Network error → Shows alert message
- Database error → Shows alert message

### Delete Errors:
- Storage deletion fails → Shows alert message
- Database deletion fails → Shows alert message

## Security Considerations

### Current Implementation:
- RLS disabled on `demand_list_files` table
- Files stored in public storage bucket
- No file type validation beyond extension
- No file size validation

### Future Improvements:
1. Enable RLS with proper policies
2. Add file type validation
3. Add file size limits
4. Scan files for malware
5. Add audit logging
6. Implement file versioning

## Benefits

1. **Streamlined Workflow**: VEC can submit demand lists digitally
2. **Centralized Storage**: All demand lists stored in one place
3. **Easy Access**: Admin can download and review anytime
4. **Audit Trail**: Upload date and uploader tracked
5. **Monthly Organization**: Files organized by village/month/year

## Testing Checklist

- [ ] Run database migration SQL
- [ ] Push code to GitHub
- [ ] Test VEC upload functionality
- [ ] Test VEC delete functionality
- [ ] Test admin download functionality
- [ ] Test file replacement (upload new file)
- [ ] Test month/year switching
- [ ] Test village switching (admin)
- [ ] Verify file storage in Supabase
- [ ] Check database records
- [ ] Test error scenarios

## Notes

- Files are stored in the same bucket as wagelists (`wagelists`)
- File path includes `demand_lists/` prefix to separate from wagelists
- One file per village per month/year (enforced by UNIQUE constraint)
- Uploading a new file automatically deletes the old one from storage
- Both VEC and admin can see the file info, but only VEC can upload/delete
- Admin can only download, not upload or delete

## Future Enhancements

1. **Auto-import**: Automatically import demands from uploaded Excel
2. **Validation**: Validate Excel format before accepting
3. **Preview**: Show preview of uploaded file content
4. **Notifications**: Notify admin when new file is uploaded
5. **Comments**: Allow admin to add comments on uploaded file
6. **Approval Workflow**: VEC uploads → Admin approves → Demands created
7. **History**: Keep history of all uploaded files (not just current)
