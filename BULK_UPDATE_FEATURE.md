# Bulk Update Days & Amount Feature

## 🎯 Overview

Added bulk update functionality for **Days Worked** and **Wage Amount** fields in the Demands tab. This allows admin users to quickly set these values for all demands in a selected month/year without editing each row individually.

---

## ✨ Features

### 1. **Bulk Update Panel**
- Located in the admin bulk actions section
- Two input fields: Days Worked and Wage Amount
- "Apply to All" button to update all demands at once
- Shows count of demands that will be updated
- Displays selected month and year for confirmation

### 2. **Smart Validation**
- At least one field must be filled (days OR amount)
- Empty fields are skipped (won't overwrite existing values)
- Button disabled if both fields are empty
- Loading state shows "Updating..." during operation

### 3. **User-Friendly UX**
- Clear labels and placeholder examples
- Helper text explains the behavior
- Visual feedback with loading spinner
- Success/error alerts
- Auto-refresh after update

---

## 📋 How to Use

### Step 1: Import Demands (Without Days/Amount)
1. Login as **admin** (`admin` / `admin123`)
2. Select a **village** from dropdown
3. Go to **Demands** tab
4. Select **month** and **year**
5. Click **"Import Excel"**
6. Upload Excel file (days and amount columns can be empty or zero)

### Step 2: Bulk Update Days & Amount
1. After import, you'll see the **Bulk Actions** panel
2. Find the **"Update Days & Amount for All"** section
3. Enter values:
   - **Days Worked**: e.g., `15` (leave empty to skip)
   - **Wage Amount**: e.g., `4500` (leave empty to skip)
4. Click **"Apply to All"**
5. ✅ All demands updated instantly!

### Step 3: Verify
- Check the table/cards - all demands now show the new values
- Individual editing still works if you need to adjust specific rows

---

## 💡 Use Cases

### Scenario 1: Standard Monthly Wage
- All workers worked **15 days** at **₹300/day**
- Bulk update: Days = 15, Amount = 4500
- Applies to all 50 demands in one click

### Scenario 2: Partial Update
- Days already filled, but amounts missing
- Bulk update: Leave Days empty, enter Amount = 4500
- Only amounts updated, days unchanged

### Scenario 3: Fix Import Errors
- Imported with wrong values
- Bulk update with correct values
- Overwrites all rows instantly

---

## 🔧 Technical Details

### Database Function
```typescript
bulkUpdateDemandDetails(
  village: string,
  month: number,
  year: number,
  updates: { daysWorked?: number; wageAmount?: number }
)
```

### Behavior
- Updates ALL demands matching village/month/year
- Only updates fields that have values (not empty)
- Single database query for efficiency
- Returns success/failure status

### UI States
- **Disabled**: When both fields empty
- **Loading**: Shows spinner during update
- **Success**: Clears inputs, refreshes data
- **Error**: Shows alert message

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────┐
│ Bulk Actions                                │
├─────────────────────────────────────────────┤
│ Credit Status                               │
│ 5 pending • 10 credited                     │
│ [Mark All as Credited] [Mark All as Pending]│
├─────────────────────────────────────────────┤
│ Update Days & Amount for All                │
│                                             │
│ Days Worked:        Wage Amount (₹):        │
│ [  15  ]            [  4500  ]              │
│                                             │
│ [Apply to All]                              │
│                                             │
│ Leave fields empty to skip. This will       │
│ update all 50 demands for August 2026.      │
├─────────────────────────────────────────────┤
│                        [Delete All Demands] │
└─────────────────────────────────────────────┘
```

---

## ✅ Benefits

1. **Time Saving**: Update 100 demands in 1 click vs 100 individual edits
2. **Consistency**: Ensures all demands have correct values
3. **Flexibility**: Update days only, amount only, or both
4. **Safety**: Empty fields are preserved (no accidental overwrites)
5. **Efficiency**: Single database query instead of multiple updates

---

## 🧪 Testing Checklist

- [ ] Import demands with empty days/amount
- [ ] Bulk update both fields → All rows updated
- [ ] Bulk update days only → Only days changed
- [ ] Bulk update amount only → Only amount changed
- [ ] Try with both fields empty → Button disabled
- [ ] Verify count shows correct number of demands
- [ ] Check month/year displayed correctly
- [ ] Test loading state (spinner appears)
- [ ] Verify data persists after refresh
- [ ] Test individual edit still works after bulk update

---

## 🚀 Next Steps

After pushing to GitHub:
1. Wait for Vercel to redeploy
2. Test the bulk update feature
3. Verify it works with your real data
4. Let me know if you need any adjustments!

---

## 📝 Notes

- **Admin only**: Village users cannot use bulk update
- **Village required**: Must select village first
- **Month/Year specific**: Only updates demands for selected period
- **Non-destructive**: Empty fields are preserved
- **Instant feedback**: Table updates immediately after bulk update

This feature significantly speeds up the workflow when dealing with large demand lists! 🎉
