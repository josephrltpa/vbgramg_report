# Job Card Status Filter Feature

## 🎯 Overview

Added a status filter to the Job Card List that allows you to quickly view only **Active**, **Inactive**, or **All** job cards. This makes it easier to manage and review job cards based on their status.

---

## ✨ Features

### Three Filter Options

1. **All** - Shows all job cards (default)
2. **Active** - Shows only active job cards
3. **Inactive** - Shows only inactive job cards

### Visual Indicators

- Each filter button shows the **count** of job cards in that category
- Active filter uses **green** color scheme
- Inactive filter uses **gray** color scheme
- All filter uses **indigo** color scheme
- Icons (✓ for Active, ✗ for Inactive) for quick visual recognition

---

## 📍 Location

The status filter appears **below the search bar** in the Job Card List tab:

```
┌─────────────────────────────────────────┐
│ 🔍 Search by name or JC number...       │
└─────────────────────────────────────────┘

Filter: [All (150)] [✓ Active (120)] [✗ Inactive (30)]

┌─────────────────────────────────────────┐
│ Job Card List Table                     │
└─────────────────────────────────────────┘
```

---

## 🧪 How to Use

### Step 1: Navigate to Job Card List
1. Login to the app
2. Select a village from the dropdown
3. Go to **Job Card List** tab

### Step 2: Use the Filter
1. Look for the **Filter:** section below the search bar
2. Click one of the three buttons:
   - **All (150)** - Shows all 150 job cards
   - **Active (120)** - Shows only 120 active job cards
   - **Inactive (30)** - Shows only 30 inactive job cards

### Step 3: Combine with Search
You can combine the status filter with the search bar:
- First, click **Active** to show only active cards
- Then, type in the search box to find a specific person
- Result: Shows only active cards that match your search

---

## 💡 Use Cases

### Use Case 1: Review Inactive Job Cards
**Scenario**: You want to review all inactive job cards to decide if they should be reactivated.

**Steps**:
1. Click **Inactive (30)** filter
2. Review the list of 30 inactive cards
3. Click on any card's status badge to reactivate it
4. Watch the count update in real-time

### Use Case 2: Find Active Worker
**Scenario**: You need to find a specific active worker quickly.

**Steps**:
1. Click **Active (120)** filter
2. Type the worker's name in the search box
3. Find the worker instantly among active cards only

### Use Case 3: Monthly Report
**Scenario**: You need to generate a report of all active job cards for the month.

**Steps**:
1. Click **Active** filter
2. Export or screenshot the filtered list
3. Use it for your monthly report

---

## 🔄 Real-time Updates

The filter counts update automatically when:
- You **import** new job cards from Excel
- You **toggle** a job card's status (Active ↔ Inactive)
- You **delete** job cards
- You **change village** (filter resets to "All")

---

## 🎨 Visual Design

### Filter Buttons

| Button | Color | Icon | Example |
|--------|-------|------|---------|
| All | Indigo (when active) | None | `All (150)` |
| Active | Emerald/Green (when active) | ✓ | `✓ Active (120)` |
| Inactive | Gray (when active) | ✗ | `✗ Inactive (30)` |

### Behavior

- **Selected filter**: Colored background with white text
- **Unselected filters**: Light gray background with dark text
- **Hover effect**: Slightly darker background on hover
- **Responsive**: Works on both desktop and mobile

---

## 🔧 Technical Details

### State Management

```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
```

### Filter Logic

```typescript
const filtered = jobCards.filter(jc => {
  // Search filter
  const matchesSearch = jc.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jc.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Status filter
  const matchesStatus = statusFilter === 'all' || 
    (statusFilter === 'active' && jc.isActive) ||
    (statusFilter === 'inactive' && !jc.isActive);
  
  return matchesSearch && matchesStatus;
});
```

### Reset Behavior

When you change the village, the filter automatically resets to "All":

```typescript
async function loadJobCards() {
  // ... load data ...
  setStatusFilter('all'); // Reset status filter
}
```

---

## 📊 Count Display

Each filter button shows the count in real-time:

- **All (150)**: Total job cards in the village
- **Active (120)**: `jobCards.filter(jc => jc.isActive).length`
- **Inactive (30)**: `jobCards.filter(jc => !jc.isActive).length`

The counts are calculated from the full `jobCards` array, not the filtered results, so they always show accurate numbers.

---

## 🧪 Testing Checklist

- [ ] Click "All" - shows all job cards
- [ ] Click "Active" - shows only active cards
- [ ] Click "Inactive" - shows only inactive cards
- [ ] Counts are accurate for each filter
- [ ] Combine filter with search - works correctly
- [ ] Toggle a card's status - counts update
- [ ] Import new cards - counts update
- [ ] Change village - filter resets to "All"
- [ ] Pagination works with filter applied
- [ ] Mobile view shows filter buttons correctly
- [ ] Filter buttons are responsive on small screens

---

## 🚀 Benefits

1. **Quick Access**: Instantly view only active or inactive cards
2. **Better Management**: Focus on what matters (e.g., only active workers)
3. **Accurate Counts**: See exactly how many cards in each category
4. **Combined Filtering**: Works with search for precise results
5. **Visual Clarity**: Color-coded buttons for easy identification

---

## 📝 Notes

- Filter resets to "All" when you change villages
- Filter works with pagination (shows filtered results across pages)
- Filter counts are based on the current village's data
- You can combine status filter with text search
- Filter state is not persisted (resets on page refresh)

---

## 🎯 Example Workflow

### Morning Review

1. **Login** → Select village → Go to Job Card List
2. **Check Inactive**: Click "Inactive (30)" to review inactive cards
3. **Reactivate**: Click status badges to reactivate workers who returned
4. **Check Active**: Click "Active (120)" to see current workforce
5. **Search**: Use search to find specific workers
6. **Done**: You've reviewed and updated all job cards!

---

This feature makes managing large job card lists much more efficient! 🎉
