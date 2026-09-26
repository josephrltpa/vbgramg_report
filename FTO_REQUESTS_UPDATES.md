# FTO Reports & Requests Tab Updates

## 📅 FTO Reports - Financial Year Month Order

### Changes Made
Updated the month selector in FTO Reports to follow India's financial year (April to March):

**Before:**
- Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec

**After:**
- Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar

### Files Modified
- `src/components/FTOReportsModule.tsx`
  - Updated month selector buttons to display in financial year order
  - Updated month name display in import modal
  - Updated month name display in delete confirmation

### Note
The Monthly Demands tab already uses the `MONTHS` constant from `types.ts`, which was already in financial year order, so no changes were needed there.

---

## 📝 Requests Tab - Dynamic Form Based on Request Type

### Changes Made
Reworked the request form to show different fields based on the selected request type:

#### 1. Add New JC
**Required Fields:**
- Worker Name
- Aadhaar Number
- Bank Name
- Account Number
- Date of Birth

**Optional Fields:**
- Job Card Number (will be assigned by admin if not provided)
- Remarks

**Behavior:**
- Job Card Number is optional (VEC member may not know it)
- If not provided, system uses "PENDING" as placeholder
- Admin will assign the actual JC number when processing

#### 2. Delete JC
**Required Fields:**
- Worker Name
- Job Card Number

**Optional Fields:**
- Remarks

**Behavior:**
- Job Card Number is required (must specify which JC to delete)
- No additional personal details needed

#### 3. Correction
**Required Fields:**
- Worker Name
- Job Card Number
- Aadhaar Number
- Bank Name
- Account Number
- Date of Birth

**Optional Fields:**
- Remarks

**Behavior:**
- Job Card Number is required (must specify which JC to correct)
- Personal details required to verify identity
- Used for correcting existing JC information

### Form Validation
The form now validates based on request type:
- **Add New JC**: Requires Worker Name + Personal Details (Aadhaar, Bank, A/C, DOB)
- **Delete JC**: Requires Worker Name + Job Card Number
- **Correction**: Requires Worker Name + Job Card Number + Personal Details

### Additional Details Storage
For "Add New JC" and "Correction" requests, the personal details are automatically appended to the remarks field in this format:
```
[Original remarks]
Aadhaar: XXXX-XXXX-XXXX | Bank: [Bank Name] | A/C: [Account Number] | DOB: [Date]
```

This ensures all information is preserved in the request for admin review.

### Files Modified
- `src/components/JCRequestModule.tsx`
  - Updated state to include new fields (aadhaarNumber, bankName, accountNumber, dateOfBirth)
  - Made form fields conditional based on requestType
  - Updated validation logic
  - Added logic to append personal details to remarks

### UI Improvements
- Request Type selector moved to top (most important decision)
- Worker Name is always required and shown first
- Job Card Number field shows/hides based on request type
- Personal Details section appears in a highlighted box for Add New JC and Correction
- Clear visual indication of required fields with asterisk (*)

---

## 🧪 Testing Checklist

### FTO Reports
- [ ] Month selector shows April first
- [ ] Can select all months in financial year order
- [ ] Import modal shows correct month name
- [ ] Delete confirmation shows correct month name

### Requests Tab - Add New JC
- [ ] Form shows without Job Card Number field (or with optional field)
- [ ] Worker Name is required
- [ ] Personal Details section appears (Aadhaar, Bank, A/C, DOB)
- [ ] All personal details are required
- [ ] Can submit without Job Card Number
- [ ] Submitted request shows "PENDING" as JC number if not provided

### Requests Tab - Delete JC
- [ ] Form shows Job Card Number field (required)
- [ ] Personal Details section does NOT appear
- [ ] Cannot submit without Job Card Number
- [ ] Can submit with just Worker Name + Job Card Number

### Requests Tab - Correction
- [ ] Form shows Job Card Number field (required)
- [ ] Personal Details section appears (Aadhaar, Bank, A/C, DOB)
- [ ] All fields are required
- [ ] Cannot submit without Job Card Number
- [ ] Cannot submit without personal details

---

## 📋 Database Schema Notes

The current `jc_requests` table structure supports these changes without modification:
- `job_card_number` - Can store "PENDING" for new JC requests
- `head_name` - Worker name (always required)
- `request_type` - Add New JC / Delete JC / Correction
- `remarks` - Stores additional details (including personal info for Add/Correction)

No database migration is needed for these changes.

---

## 💡 Future Enhancements

### For Requests Tab
1. **Separate columns for personal details** - Store Aadhaar, Bank, A/C, DOB in separate columns instead of in remarks
2. **Admin assignment of JC numbers** - When admin approves "Add New JC", they can assign the actual JC number
3. **Document upload** - Allow uploading Aadhaar card, bank passbook photos
4. **Validation** - Validate Aadhaar format (12 digits), account number format
5. **Auto-fill** - For Correction requests, auto-fill existing details from the JC record

### For FTO Reports
1. **Export filtered data** - Export current view to Excel
2. **Summary statistics** - Show total amount, count by status
3. **Date range filter** - Filter by processed date range
4. **Bulk actions** - Select multiple reports for actions

---

## 🚀 Deployment

After pushing these changes:
1. FTO Reports will display months in financial year order
2. Requests tab will show dynamic form based on request type
3. No database changes required
4. Existing requests will continue to work as before
5. New requests will have enhanced data collection

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify all required fields are filled
3. Ensure request type is selected before filling details
4. Clear browser cache if form doesn't update
