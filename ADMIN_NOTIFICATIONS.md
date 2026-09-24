# Admin Notification System

## 🎯 Overview

Added a notification system for admin (Computer Assistant) to track pending job card requests from all villages. This ensures admin never misses new requests.

---

## ✨ Features

### 1. **Notification Bell Icon**
- Located in the header (desktop view) next to location selector
- Shows a red badge with count of pending requests
- Badge shows "9+" if there are more than 9 pending requests
- Badge pulses to draw attention
- Click the bell to go directly to Requests tab

### 2. **Requests Tab Badge**
- Desktop navigation: Red badge on Requests tab icon
- Mobile menu: Shows "X pending" text badge
- Bottom navigation (mobile): Red badge on Requests icon
- Badge only shows for admin users

### 3. **Auto-Refresh**
- Automatically checks for new requests every 30 seconds
- Updates badge count in real-time
- No manual refresh needed

### 4. **Smart Display**
- Badge only appears when there are pending requests
- Count updates automatically when requests are processed
- Works across all views (desktop, mobile menu, bottom nav)

---

## 📍 Notification Locations

### Desktop View

```
┌─────────────────────────────────────────────────────────┐
│ 🔔  [Location Selector]   [JC List] [Requests 🔴3] [Demands] │
└─────────────────────────────────────────────────────────┘
```

### Mobile View (Bottom Nav)

```
┌─────────────────────────────────────────┐
│                                         │
│         [Main Content Area]             │
│                                         │
├─────────────────────────────────────────┤
│  [JC List]   [Requests 🔴]   [Demands]  │
└─────────────────────────────────────────┘
```

### Mobile Menu

```
┌─────────────────────────────────────┐
│ ☰ Menu                            ✕ │
├─────────────────────────────────────┤
│ 📋 JC List                          │
│ 💬 Requests              🔴 3 pending │
│ 📅 Demands                          │
│ 🚪 Logout                           │
└─────────────────────────────────────┘
```

---

## 🧪 How It Works

### For Admin (Computer Assistant)

1. **Login as admin**
2. **Notification bell appears** in header
3. **Badge shows count** of pending requests (status = "Submitted")
4. **Auto-refreshes** every 30 seconds
5. **Click bell** → Goes to Requests tab
6. **Process requests** → Badge count decreases
7. **Badge disappears** when no pending requests

### For Village Users

- No notification bell (only admin sees it)
- No badges on tabs
- Can only see their own village's requests

---

## 🔧 Technical Implementation

### State Management

```typescript
const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
```

### Auto-Refresh Logic

```typescript
useEffect(() => {
  if (userRole === 'computer_assistant') {
    const fetchPendingCount = async () => {
      const requests = await fetchJCRequests();
      const pendingCount = requests.filter(r => r.status === 'Submitted').length;
      setPendingRequestsCount(pendingCount);
    };
    
    fetchPendingCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }
}, [userRole, activeTab]);
```

### Badge Display Logic

```typescript
const showBadge = tab.id === 'requests' && 
                  userRole === 'computer_assistant' && 
                  pendingRequestsCount > 0;
```

---

## 📊 Notification States

| Pending Count | Badge Display | Bell Icon |
|---------------|---------------|-----------|
| 0 | Hidden | Normal |
| 1-9 | Shows number (e.g., "3") | Red badge |
| 10+ | Shows "9+" | Red badge |

---

## 💡 Use Cases

### Use Case 1: Morning Review
1. Admin logs in
2. Sees bell with badge: 🔴 5
3. Clicks bell → Goes to Requests tab
4. Reviews 5 pending requests
5. Processes each request
6. Badge disappears

### Use Case 2: Real-Time Monitoring
1. Admin is working on Demands tab
2. Village submits new request
3. Within 30 seconds, bell badge updates: 🔴 1
4. Admin sees notification
5. Clicks bell to review new request

### Use Case 3: Busy Period
1. Multiple villages submit requests
2. Badge shows: 🔴 9+
3. Admin knows there are many pending requests
4. Prioritizes processing requests

---

## 🎨 Visual Design

### Bell Icon
- **Normal state**: Gray bell icon
- **With notifications**: Red pulsing badge
- **Hover effect**: Light gray background
- **Click action**: Navigate to Requests tab

### Badge Design
- **Color**: Red (#EF4444)
- **Text**: White, bold
- **Size**: 20x20px (circular)
- **Position**: Top-right of bell icon
- **Animation**: Pulse effect to draw attention

### Responsive Behavior
- **Desktop**: Bell in header, badge on tab icon
- **Mobile menu**: Text badge "X pending"
- **Bottom nav**: Small badge on icon

---

## 🔄 Refresh Behavior

### When Badge Updates
- Every 30 seconds (auto-refresh)
- When switching tabs
- When page loads
- When returning from background

### When Badge Clears
- Admin processes a request (status changes from "Submitted")
- Admin deletes a request
- No more pending requests

---

## 🧪 Testing Checklist

- [ ] Login as admin
- [ ] Bell icon appears in header
- [ ] Submit a request as village user
- [ ] Wait 30 seconds
- [ ] Badge appears on bell with count "1"
- [ ] Click bell → Goes to Requests tab
- [ ] Badge appears on Requests tab
- [ ] Process the request (mark as Completed)
- [ ] Badge disappears
- [ ] Submit multiple requests
- [ ] Badge shows correct count
- [ ] Submit 10+ requests
- [ ] Badge shows "9+"
- [ ] Login as village user
- [ ] No bell icon appears
- [ ] No badges on tabs
- [ ] Test on mobile device
- [ ] Bottom nav shows badge
- [ ] Mobile menu shows "X pending"

---

## 🚀 Benefits

1. **Never Miss Requests**: Visual notification ensures admin sees new requests
2. **Real-Time Updates**: Auto-refresh keeps count current
3. **Quick Access**: Click bell to go directly to Requests tab
4. **Clear Priority**: Badge count shows urgency
5. **Multi-Platform**: Works on desktop and mobile
6. **Non-Intrusive**: Doesn't interrupt workflow

---

## 📝 Notes

- **Admin Only**: Village users don't see notifications
- **Pending Only**: Only counts requests with status "Submitted"
- **No Sound**: Visual notification only (no audio alerts)
- **No Push Notifications**: Requires page to be open
- **30-Second Delay**: Not instant, but frequent enough

---

## 🔮 Future Enhancements

Possible improvements for later:
1. **Push Notifications**: Browser notifications even when tab is closed
2. **Sound Alerts**: Optional audio notification
3. **Email Notifications**: Daily summary email
4. **SMS Alerts**: Urgent request notifications
5. **Custom Refresh Interval**: Let admin choose refresh frequency
6. **Filter by Village**: See which villages have pending requests
7. **Priority Levels**: High/Medium/Low priority requests

---

## 🎯 Summary

Admin now has a clear, visual notification system that:
- ✅ Shows pending request count
- ✅ Auto-refreshes every 30 seconds
- ✅ Works on desktop and mobile
- ✅ Provides quick access to Requests tab
- ✅ Ensures no requests are missed

This makes managing requests from 29 villages much more efficient! 🎉
