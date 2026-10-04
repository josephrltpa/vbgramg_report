# Job Card List Export Feature

## Overview

Added two export buttons to the Job Card List for both VEC (village) users and admin users:
1. **Export Active** - Exports only active job cards
2. **Export All** - Exports all job cards (both active and inactive)

## Features

### Export Active
- Exports only job cards with status = Active
- Columns included:
  - Sl No (serial number)
  - Job Card Number
  - Head Name
- Status column is NOT included (since all are active)
- Filename: `JC_List_{village}_{DD-MM-YYYY}.xlsx`
- Example: `JC_List_Buhban_26-09-2026.xlsx`

### Export All
- Exports all job cards (both active and inactive)
- Columns included:
  - Sl No (serial number)
  - Job Card Number
  - Head Name
  - Status (Active/Inactive)
- Status column IS included to differentiate between active and inactive
- Filename: `JC_List_{village}_{DD-MM-YYYY}.xlsx`
- Example: `JC_List_Buhban_26-09-2026.xlsx`

## Implementation Details

### Button Placement
- Export buttons are visible to ALL users (both VEC and admin)
- Located in the header section next to the Reload button
- Only shown when there are job cards in the list
- Admin users also see Import Excel, Add JC, and Delete All buttons

### Button Styling
- **Export Active**: Blue button (bg-blue-600)
- **Export All**: Purple button (bg-purple-600)
- Both use the Download icon from lucide-react
- Responsive design with flex-wrap for mobile

### Date Format
- Filename uses DD-MM-YYYY format (Indian standard)
- Example: 26-09-2026 for September 26, 2026
- Consistent with other date formats in the app

### Export Logic
1. **Export Active**:
   - Filters jobCards array for `isActive === true`
   - Creates Excel with 3 columns (no status)
   - Serial numbers start from 1

2. **Export All**:
   - Uses entire jobCards array (already sorted by job card number)
   - Creates Excel with 4 columns (includes status)
   - Status shows as "Active" or "Inactive"
   - Serial numbers start from 1

## Technical Implementation

### Dependencies
- Uses `xlsx` library (already installed in package.json)
- Import: `import * as XLSX from 'xlsx';`

### Helper Function
```typescript
function formatDateForFilename(): string {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
}
```

### Export Functions
```typescript
function exportActive() {
  const activeCards = jobCards.filter(jc => jc.isActive);
  const exportData = activeCards.map((jc, index) => ({
    'Sl No': index + 1,
    'Job Card Number': jc.jobCardNumber,
    'Head Name': jc.headName,
  }));
  // ... create and download Excel file
}

function exportAll() {
  const exportData = jobCards.map((jc, index) => ({
    'Sl No': index + 1,
    'Job Card Number': jc.jobCardNumber,
    'Head Name': jc.headName,
    'Status': jc.isActive ? 'Active' : 'Inactive',
  }));
  // ... create and download Excel file
}
```

## User Workflow

### For VEC Users
1. Login to the app
2. Navigate to Job Card List tab
3. View the list of job cards
4. Click "Export Active" to get only active workers
5. OR click "Export All" to get complete list with status
6. Excel file downloads automatically

### For Admin Users
1. Same workflow as VEC users
2. Additionally can use Import Excel, Add JC, Delete All buttons
3. Export buttons work the same way

## File Structure

### Excel File Contents

**Export Active:**
```
| Sl No | Job Card Number      | Head Name          |
|-------|---------------------|--------------------|
| 1     | MZ-01-003-020-001/10| Lalngaihawma       |
| 2     | MZ-01-003-020-001/11| K Zatluanga        |
```

**Export All:**
```
| Sl No | Job Card Number      | Head Name          | Status   |
|-------|---------------------|--------------------|----------|
| 1     | MZ-01-003-020-001/10| Lalngaihawma       | Active   |
| 2     | MZ-01-003-020-001/11| K Zatluanga        | Active   |
| 3     | MZ-01-003-020-001/12| Old Worker         | Inactive |
```

## Benefits

1. **Flexibility**: Users can choose what to export
2. **Clarity**: Different buttons for different needs
3. **Efficiency**: Quick export without manual filtering
4. **Consistency**: Standard filename format
5. **Accessibility**: Available to all user roles

## Testing Checklist

- [ ] Export Active button visible to all users
- [ ] Export All button visible to all users
- [ ] Export Active exports only active cards
- [ ] Export All exports all cards with status
- [ ] Filename format is correct (JC_List_{village}_{DD-MM-YYYY}.xlsx)
- [ ] Excel file opens correctly in Excel/LibreOffice
- [ ] Serial numbers are correct
- [ ] Status column shows "Active" or "Inactive" correctly
- [ ] Buttons only show when job cards exist
- [ ] No errors in browser console
- [ ] Works on mobile devices

## Future Enhancements

Possible improvements for future versions:
1. Export filtered results (based on search query)
2. Export selected job cards (checkbox selection)
3. Add more columns to export (village, created date, etc.)
4. Export to CSV format as well
5. Batch export for multiple villages (admin only)
6. Custom column selection dialog

## Notes

- Export uses client-side processing (no server load)
- Excel file is generated in browser and downloaded immediately
- No data is sent to server during export
- Works offline if data is already loaded
- File size depends on number of job cards
