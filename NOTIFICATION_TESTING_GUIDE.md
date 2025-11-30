# Notification System Testing Guide

## How to Test the Notification Features

### 1. **Basic Functionality Testing**

#### Test Notification Bell
1. **Start the application**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Login** to your account (must be authenticated)

3. **Check Bell Icon**
   - Look for the bell icon in the top header (near user profile)
   - If you have unread notifications, you should see a red badge with count
   - Badge shows "9+" for counts greater than 9

#### Test Notification Center
1. **Click the bell icon** - Notification center should open
2. **Check empty state** - If no notifications, you'll see:
   - Bell with slash icon
   - "No notifications yet" message
   - Helper text below

3. **Test closing**:
   - Click outside the notification center (should close)
   - Press `Escape` key (should close)
   - Click the X button in header (should close)

### 2. **Testing with Real Notifications**

#### Option A: Backend API (Recommended)
1. **Create notifications** via backend API or database:
   ```javascript
   // Example: Create a test notification in MongoDB
   {
     user: <your_user_id>,
     type: "EVENT_REMINDER",
     status: "UNREAD",
     title: "Test Notification",
     message: "This is a test notification message",
     createdAt: new Date()
   }
   ```

2. **Refresh the page** - Notification badge should appear

3. **Click bell** - Notification should appear in list

#### Option B: Mock Data (Quick Testing)
1. **Temporarily modify** `frontend/src/api/notifications.ts`:
   ```typescript
   // Add mock data for testing
   if (process.env.NODE_ENV === 'development') {
     return {
       notifications: [
         {
           _id: '1',
           type: 'EVENT_REMINDER',
           message: 'Test notification - Event starts in 30 minutes!',
           createdAt: new Date().toISOString(),
           isRead: false,
           status: 'UNREAD'
         }
       ],
       pagination: { currentPage: 1, totalPages: 1, totalCount: 1 }
     };
   }
   ```

### 3. **Test All Features**

#### ✅ Mark as Read
1. Click on any unread notification
2. Notification should:
   - Change background from blue to white
   - Remove blue dot indicator
   - Navigate to relevant page (if applicable)
   - Badge count should decrement

#### ✅ Mark All as Read
1. Open notification center
2. Click "Mark all as read" button
3. All notifications should become read
4. Badge should disappear (count = 0)

#### ✅ Click-through Navigation
1. Click different notification types:
   - **EVENT_REMINDER** → Event details page
   - **NEW_COMMENT** → Event details page (scrolls to comments)
   - **EVENT_CANCELLED** → Events list page

#### ✅ Real-time Polling
1. **Open browser DevTools** → Network tab
2. **Watch for API calls** - Should see:
   - `/api/v1/notifications/unread/count` every 30 seconds
3. **Create a new notification** (via backend)
4. **Wait up to 30 seconds** - Badge count should update automatically

#### ✅ Timestamp Updates
1. Open notification center
2. **Watch timestamps** - They should update every minute:
   - "just now" → "1 minute ago" → "2 minutes ago"
   - Use browser DevTools to speed up time (or wait naturally)

#### ✅ Pagination / Load More
1. **Create 25+ notifications** (via backend)
2. Open notification center
3. Scroll to bottom
4. **"Load More" button** should appear
5. Click it - More notifications load
6. Button shows "Loading..." while fetching

### 4. **Test Responsive Design**

#### Mobile View
1. **Resize browser** to mobile width (< 768px)
2. Click bell icon
3. Notification center should:
   - Open as full-screen modal (bottom sheet)
   - Have backdrop overlay
   - Slide up from bottom

#### Desktop View
1. **Full screen** (≥ 768px)
2. Click bell icon
3. Notification center should:
   - Open as dropdown below bell
   - Aligned with bell icon (not stuck to edge)
   - Fade in animation

### 5. **Test Error Handling**

#### Network Error
1. **Open DevTools** → Network tab
2. **Set to Offline** or block `/api/v1/notifications/*`
3. Click bell - Should show error message with "Retry" button

#### Mark as Read Error
1. **Block PATCH requests** in Network tab
2. Click notification - Should show error toast
3. Notification state should revert (optimistic update rollback)

### 6. **Visual Checks**

#### Notification Types & Icons
Check each notification type displays correct icon:
- ⏰ EVENT_REMINDER - Clock icon (blue)
- ✅ REGISTRATION_CONFIRMED - CheckCircle icon (green)
- ℹ️ EVENT_UPDATED - Info icon (indigo)
- ❌ EVENT_CANCELLED - XCircle icon (red)
- ⬆️ WAITLIST_PROMOTED - ArrowUp icon (yellow)
- 💬 NEW_COMMENT - MessageCircle icon (purple)

#### Badge Animation
1. **Watch badge when count changes**:
   - Should pulse/scale when count increases
   - Should animate on page load if unread exists

### 7. **Console Checks**

Open browser DevTools → Console tab:
- ✅ No errors in console
- ✅ Polling logs: Check for repeated API calls every 30s
- ✅ Error logs: Should see helpful error messages if API fails

## Quick Test Checklist

- [ ] Bell icon appears in header when authenticated
- [ ] Badge shows unread count (or hidden if 0)
- [ ] Badge shows "9+" for counts > 9
- [ ] Click bell opens notification center
- [ ] Empty state displays when no notifications
- [ ] Notifications display with icons, messages, timestamps
- [ ] Unread notifications have blue background
- [ ] Click notification marks as read and navigates
- [ ] "Mark all as read" button works
- [ ] Timestamps update every minute
- [ ] "Load More" button appears when more notifications exist
- [ ] Real-time polling updates badge every 30 seconds
- [ ] Close on outside click works
- [ ] Close on Escape key works
- [ ] Mobile: Full-screen modal
- [ ] Desktop: Dropdown aligned with bell
- [ ] Error handling shows retry button
- [ ] Loading states show spinners

## Debugging Tips

1. **Check API endpoints** in Network tab
2. **Verify authentication** - tokens must be valid
3. **Check console** for error messages
4. **Verify backend routes** are registered
5. **Check notification data format** matches expected structure

## Common Issues

**No notifications showing:**
- Check backend API is running
- Verify authentication tokens
- Check browser console for errors
- Verify notification routes exist

**Badge not updating:**
- Check polling is enabled
- Verify `/api/v1/notifications/unread/count` endpoint works
- Check network tab for API calls

**Positioning issues:**
- Check bell container has `relative` positioning
- Verify notification center has `absolute` positioning
- Check z-index conflicts

