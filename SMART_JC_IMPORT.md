# Smart JC Import Filtering

## 🎯 Overview

The Job Card Excel import now includes **smart filtering** based on the VBGRAMG report format. It automatically handles the `*` marker and `ACTIVE` status to import only the relevant job cards with correct active/inactive status.

---

## ✨ Smart Filtering Logic

Based on your VBGRAMG report format:

| Job Card Number | Head Name | Status | Action |
|----------------|-----------|--------|--------|
| `MZ-01-003-002-001/10 *` | Lalremtluanga hnamte | (empty) | **SKIPPED** (has `*`) |
| `MZ-01-003-003-001/1` | Agnes Lalrinchhani | (empty) | **IMPORTED** as Inactive |
| `MZ-01-003-003-001/1-D *` | Thanpari | (empty) | **SKIPPED** (has `*`) |
| `MZ-01-003-003-001/1001` | HUNTHARNGHAKA | ACTIVE | **IMPORTED** as Active |
| `MZ-01-003-003-001/1002 *` | Vanlalfela | (empty) | **SKIPPED** (has `*`) |
| `MZ-01-003-003-001/1003` | Kapchhungi | ACTIVE | **IMPORTED** as Active |
| `MZ-01-003-003-001/1004` | Saihlunpuii | ACTIVE | **IMPORTED** as Active |

---

## 📋 Filtering Rules

### Rule 1: Skip JCs with `*` at the end
- **Condition**: Job Card Number ends with `*`
- **Action**: Completely skipped (not imported)
- **Reason**: These are typically deleted/cancelled job cards in VBGRAMG reports
- **Example**: `MZ-01-003-002-001/10 *` → Skipped

### Rule 2: Import "ACTIVE" status JCs as Active
- **Condition**: Status column contains "ACTIVE" (case-insensitive)
- **Action**: Imported with `is_active: true`
- **Reason**: These are currently active job cards
- **Example**: `MZ-01-003-003-001/1001` with status "ACTIVE" → Imported as Active

### Rule 3: Import JCs with no status as Inactive
- **Condition**: Status column is empty or doesn't say "ACTIVE"
- **Action**: Imported with `is_active: false`
- **Reason**: These are historical or inactive job cards
- **Example**: `MZ-01-003-003-001/1` with no status → Imported as Inactive

---

## 🧪 How to Use

### Step 1: Prepare Your Excel File

Your Excel file should have these columns:
```
| Job Card Number              | Head Name              | Status |
|------------------------------|------------------------|--------|
| MZ-01-003-003-001/1001       | HUNTHARNGHAKA          | ACTIVE |
| MZ-01-003-003-001/1002 *     | Vanlalfela             |        |
| MZ-01-003-003-001/1003       | Kapchhungi             | ACTIVE |
| MZ-01-003-002-001/10 *       | Lalremtluanga hnamte   |        |
```

**Column names accepted:**
- Job Card Number: `Job Card Number`, `JC Number`, `job_card_number`
- Head Name: `Head Name`, `Name`, `head_name`
- Status: `Status`, `status` (optional)

### Step 2: Import in the App

1. Login as **admin** (`admin` / `admin123`)
2. Select a **village** from dropdown
3. Go to **JC List** tab
4. Click **"Import Excel"**
5. Upload your Excel file
6. Review the import results

### Step 3: Check Results

You'll see a summary like:
```
✓ Successfully imported: 3
⊘ Skipped (marked with *): 2
✗ Failed: 0
```

---

## 📊 Import Results Breakdown

### Example Import

**Input Excel (9 rows):**
```
MZ-01-003-002-001/10 *     Lalremtluanga hnamte     (empty)
MZ-01-003-003-001/1        Agnes Lalrinchhani       (empty)
MZ-01-003-003-001/1-D *    Thanpari                 (empty)
MZ-01-003-003-001/1000 *   Material vanlalfeli      (empty)
MZ-01-003-003-001/1001     HUNTHARNGHAKA            ACTIVE
MZ-01-003-003-001/1002 *   Vanlalfela               (empty)
MZ-01-003-003-001/1003     Kapchhungi               ACTIVE
MZ-01-003-003-001/1004     Saihlunpuii              ACTIVE
MZ-01-003-003-001/1005     Tuanchhungi              ACTIVE
```

**Results:**
- ✅ **Imported as Active**: 4 (HUNTHARNGHAKA, Kapchhungi, Saihlunpuii, Tuanchhungi)
- ✅ **Imported as Inactive**: 1 (Agnes Lalrinchhani)
- ⊘ **Skipped**: 4 (all with `*` at the end)
- ✗ **Failed**: 0

**Total**: 9 rows processed → 5 imported, 4 skipped

---

## 🎨 Visual Indicators

### In the Import Modal

After import, you'll see:
```
┌─────────────────────────────────────┐
│ Import Results:                     │
│                                     │
│ ✓ Successfully imported: 5          │
│ ⊘ Skipped (marked with *): 4        │
│ ✗ Failed: 0                         │
└─────────────────────────────────────┘
```

### In the JC List

After import, you'll see:
- **Active JCs**: Green badge with "Active"
- **Inactive JCs**: Gray badge with "Inactive"
- **Skipped JCs**: Not in the list at all

---

## 🔧 Technical Details

### Code Logic

```typescript
// 1. Check if JC number ends with *
if (jobCardNumber.endsWith('*')) {
  result.skipped++;
  continue; // Skip this row
}

// 2. Determine active status
const isActive = status.toString().trim().toUpperCase() === 'ACTIVE';

// 3. Import with correct status
await supabase.from('job_cards').insert({
  job_card_number: jobCardNumber,
  head_name: headName,
  village: village,
  is_active: isActive, // true if "ACTIVE", false otherwise
});
```

### Database Schema

```sql
job_cards table:
- job_card_number (TEXT)
- head_name (TEXT)
- village (TEXT)
- is_active (BOOLEAN) ← Set based on Status column
```

---

## 💡 Benefits

1. **Automatic Filtering**: No need to manually remove `*` entries
2. **Correct Status**: Active/inactive status set automatically
3. **Time Saving**: Import entire VBGRAMG report without pre-processing
4. **Accurate Data**: Only relevant job cards imported
5. **Clear Feedback**: See exactly what was imported, skipped, and failed

---

## 🧪 Testing Checklist

- [ ] Import Excel with mix of `*` and non-`*` JCs
- [ ] Verify `*` JCs are skipped
- [ ] Verify "ACTIVE" JCs imported as active
- [ ] Verify empty status JCs imported as inactive
- [ ] Check import results show correct counts
- [ ] Verify skipped count matches `*` entries
- [ ] Check JC List shows correct active/inactive badges
- [ ] Test with case variations ("active", "Active", "ACTIVE")
- [ ] Test with extra spaces in status column
- [ ] Verify no errors for valid rows

---

## 📝 Notes

- **Case-insensitive**: "ACTIVE", "active", "Active" all work
- **Trimmed**: Extra spaces in status are ignored
- **Optional Status**: If Status column is missing, all imported as inactive
- **No Pre-processing**: Import VBGRAMG report directly without editing
- **Reversible**: You can manually change active/inactive status later

---

## 🚀 Next Steps

After pushing to GitHub:
1. Wait for Vercel to redeploy
2. Test with your actual VBGRAMG report
3. Verify the filtering works correctly
4. Check that active/inactive status is set properly
5. Let me know if you need any adjustments!

This smart filtering makes importing from VBGRAMG reports much easier and more accurate! 🎉
