# FTO Reports Feature

## 🎯 Overview

The FTO Reports tab allows you to import FTO (Fund Transfer Order) reports from the government portal (VBGRAMG) and display them in a clean, searchable format. This feature filters out unnecessary columns and shows only the essential information you need.

---

## ✨ Features

### 1. **Excel Import**
- Upload FTO reports directly from the government portal
- Supports `.xlsx` and `.xls` files
- Automatic column mapping (flexible column name detection)
- Shows import results with success/failure counts

### 2. **Filtered Display**
Shows only the columns you need:
- **Job Card No** - The job card number
- **Applicant Name** - Name of the applicant
- **Amount** - Amount to be credited (formatted as currency)
- **Status** - Payment status with color-coded badges
- **Processed Date** - Date when processed (formatted)
- **Bank Name** - Bank name (renamed from "Paid in account of (in case of ABP)")

### 3. **Search & Filter**
- Search by job card number, applicant name, status, or bank name
- Real-time filtering as you type
- Works on both desktop and mobile

### 4. **Responsive Design**
- **Desktop**: Full table view with all columns
- **Mobile**: Card view with essential information
- Touch-friendly interface

### 5. **Data Management**
- Delete individual reports (future enhancement)
- Delete all reports for a village
- Import history tracking

---

## 📋 How to Use

### Step 1: Export from Government Portal

1. Login to the VBGRAMG portal
2. Navigate to the FTO transaction details page
3. Apply any filters you need (date range, status, etc.)
4. Click the **"Download as Excel"** button
5. Save the Excel file to your computer

### Step 2: Import to VBGRAMG Webapp

1. Login to the VBGRAMG Webapp
2. **Select a village** from the location selector (admin only)
3. Click on the **"FTO Reports"** tab
4. Click the **"Import Report"** button (green button)
5. Select the Excel file you downloaded
6. Wait for the import to complete
7. View the import results:
   - ✓ Successfully imported: X records
   - ✗ Failed: Y records (with error details)

### Step 3: View and Search

1. The imported data appears in a table (desktop) or cards (mobile)
2. Use the **search bar** to find specific records:
   - Search by job card number
   - Search by applicant name
   - Search by status
   - Search by bank name
3. Results update in real-time as you type

### Step 4: Manage Reports

- **Delete All**: Click the red "Delete All" button to remove all FTO reports for the selected village
- **Import More**: You can import multiple Excel files - they will be appended to existing data

---

## 🎨 Column Mapping

The import function is flexible and can handle various column name formats:

| Your Column Name | Mapped To |
|-----------------|-----------|
| Job Card No, Job Card Number, JC Number | Job Card No |
| Applicant Name, Name | Applicant Name |
| Amount to be credited, Amount | Amount |
| Status | Status |
| Processed Date, Date | Processed Date |
| Paid in account of (in case of ABP), Bank Name, Paid in account of | Bank Name |

**Note**: The column "Paid in account of (in case of ABP)" is automatically renamed to "Bank Name" for better readability.

---

## 📊 Status Color Coding

The status column uses color-coded badges for easy identification:

- 🟢 **Green** (emerald): Status contains "credit" or "paid" → Payment completed
- 🟡 **Yellow/Amber**: Status contains "pending" or "process" → Payment in progress
- ⚪ **Gray**: Other statuses → Unknown or other status

---

## 🔧 Technical Details

### Database Schema

```sql
CREATE TABLE fto_reports (
  id UUID PRIMARY KEY,
  job_card_no TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  amount_to_be_credited NUMERIC(12, 2),
  status TEXT,
  processed_date DATE,
  bank_name TEXT,
  village TEXT NOT NULL,
  imported_at TIMESTAMP,
  source_file TEXT
);
```

### Import Process

1. Parse Excel file using XLSX library
2. Map columns flexibly (handles various column names)
3. Validate required fields (Job Card No, Applicant Name)
4. Parse dates (handles various date formats)
5. Insert records into Supabase database
6. Return import results (success/failure counts)

### Data Flow

```
Government Portal (VBGRAMG)
    ↓
Export as Excel
    ↓
Upload to VBGRAMG Webapp
    ↓
Parse & Map Columns
    ↓
Store in Supabase (fto_reports table)
    ↓
Display in FTO Reports tab
```

---

## 🧪 Testing Checklist

### Setup
- [ ] Run the SQL schema in Supabase (supabase-fto-reports.sql)
- [ ] Push code to GitHub
- [ ] Wait for Vercel to redeploy

### Import Testing
- [ ] Login as admin
- [ ] Select a village
- [ ] Go to FTO Reports tab
- [ ] Click "Import Report"
- [ ] Upload an Excel file from government portal
- [ ] Verify import results show correct counts
- [ ] Check that data appears in the table

### Display Testing
- [ ] Verify all 6 columns are displayed correctly
- [ ] Check amount formatting (₹ symbol, commas)
- [ ] Check date formatting
- [ ] Verify status color coding
- [ ] Test search functionality
- [ ] Test on mobile device (card view)

### Management Testing
- [ ] Import multiple files (data should append)
- [ ] Delete all reports for a village
- [ ] Verify deletion confirmation modal
- [ ] Check that data is removed after deletion

### Edge Cases
- [ ] Import file with missing columns (should show errors)
- [ ] Import file with empty rows (should skip)
- [ ] Import file with invalid dates (should handle gracefully)
- [ ] Search with no results (should show "No FTO reports found")

---

## 💡 Tips & Best Practices

### For Admin Users

1. **Select Village First**: Always select a village before importing
2. **Regular Imports**: Import FTO reports regularly to keep data current
3. **Delete Old Reports**: Periodically delete old reports to keep the database clean
4. **Use Filters**: Export filtered data from government portal to import only what you need

### For Village Users

1. **View Only**: Village users can view FTO reports but cannot import or delete
2. **Search**: Use search to find specific job cards or applicants
3. **Status Check**: Use status badges to quickly identify payment status

### Data Management

1. **File Naming**: Keep track of which files you've imported (source_file is stored)
2. **Duplicate Handling**: The system allows duplicate imports - be careful not to import the same file twice
3. **Backup**: Consider keeping copies of imported Excel files for reference

---

## 🚀 Future Enhancements

Potential features for future versions:

1. **Export to Excel**: Export filtered data back to Excel
2. **Date Range Filter**: Filter reports by date range
3. **Status Filter**: Filter by specific status values
4. **Bulk Delete**: Select and delete multiple reports
5. **Edit Reports**: Edit individual report fields
6. **Statistics Dashboard**: Show summary statistics (total amount, pending count, etc.)
7. **Auto-Import**: Scheduled automatic imports from government portal (requires API access)
8. **Comparison View**: Compare current vs previous month's reports
9. **Print View**: Optimized print layout for reports
10. **Audit Trail**: Track who imported/deleted reports and when

---

## 🐛 Troubleshooting

### Issue: "Please select a village first"
**Solution**: As admin, you must select a village from the location selector before importing FTO reports.

### Issue: Import shows 0 successful records
**Solution**: Check the error messages. Common issues:
- Missing required columns (Job Card No, Applicant Name)
- Invalid data format
- Empty rows in Excel file

### Issue: Data not showing after import
**Solution**: 
- Refresh the page
- Check that you're viewing the correct village
- Verify the import was successful (check import results)

### Issue: Date showing as "-"
**Solution**: The processed date field is empty in the Excel file. This is normal if the government portal doesn't provide this information.

### Issue: Amount showing as ₹0
**Solution**: The amount column in the Excel file is empty or contains invalid data. Check the source Excel file.

---

## 📝 Notes

- **Admin Only**: Only admin (computer_assistant) can import and delete FTO reports
- **Village-Specific**: FTO reports are tied to specific villages
- **Append Mode**: Importing adds to existing data (doesn't replace)
- **No Validation**: The system doesn't validate if job card numbers exist in the JC List
- **Date Parsing**: The system tries to parse dates in various formats, but may not handle all formats correctly

---

## 🎯 Summary

The FTO Reports feature provides a clean, searchable view of FTO data imported from the government portal. It filters out unnecessary columns and presents only the essential information in a user-friendly format, making it easy to track payment status and bank details for job card holders.

**Key Benefits:**
- ✅ Clean, focused view of FTO data
- ✅ Easy import from government portal
- ✅ Powerful search functionality
- ✅ Mobile-friendly design
- ✅ Color-coded status indicators
- ✅ Village-specific data management
