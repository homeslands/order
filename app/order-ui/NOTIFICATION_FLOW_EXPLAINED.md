# 🔔 NOTIFICATION SYSTEM - FLOW HOÀN CHỈNH

## 📋 OVERVIEW

```
Backend (Firebase Admin SDK)
    ↓ Gửi notification
Firebase Cloud Messaging (FCM)
    ↓ Push đến device
Your App (Web/iOS/Android)
    ↓ Nhận và xử lý
User thấy notification
```

---

## 🚀 PHASE 1: KHỞI TẠO & ĐĂNG KÝ TOKEN

### **1.1. User Login**

**File:** `components/app/form/login-form.tsx`

```typescript
Login thành công
  ↓
1. Lấy FCM token
   - Web: getWebFcmToken() → Request permission → Register service worker → Get token
   - Native: getNativeFcmToken() → Request permission → Get token
  ↓
2. Add token vào registration queue
   tokenRegistrationQueue.enqueue({
     token: 'fcm_token_abc123...',
     platform: 'web',
     userAgent: 'Chrome/120...'
   })
  ↓
3. Queue tự động process
   - Call API: POST /notification/firebase/register-device-token
   - Retry nếu fail (1s, 5s, 15s delays)
   - Max 3 retries
  ↓
4. Success → Save to localStorage
   - fcm_token: 'abc123...'
   - fcm_token_registered_at: '1730448000000'
```

---

### **1.2. Token được lấy lúc nào?**

**File:** `components/app/notification-provider.tsx`

```typescript
NotificationProvider mount (khi user đã login)
  ↓
useFirebaseNotification(userInfo?.slug)
  ↓
Platform check:
  - Web → getWebFcmToken()
  - Native → getNativeFcmToken()
  ↓
Token được lưu vào:
  1. userStore.deviceToken
  2. localStorage.fcm_token
```

---

## 🎧 PHASE 2: LẮNG NGHE NOTIFICATIONS

### **2.1. Setup Listeners**

**File:** `hooks/use-notification-listener.ts`

```typescript
NotificationProvider mount
  ↓
useNotificationListener()
  ↓
Platform check:
  - Web → setupWebListener()
  - Native → setupNativeListener()
```

---

### **2.2. WEB - Foreground & Background**

#### **A. FOREGROUND (App đang mở):**

**File:** `hooks/use-notification-listener.ts`

```typescript
Firebase onMessage listener
  ↓
Notification received
  ↓
1. Show browser notification (Notification API)
2. Set latestNotification state
  ↓
NotificationProvider useEffect detect latestNotification
  ↓
Show custom toast:
  - Title, Body
  - "Xem chi tiết" button (nếu có URL)
  - Close button
  ↓
Play sound (notification.mp3)
```

**Flow chart:**
```
Backend gửi notification
  ↓
FCM → Browser
  ↓
onMessage() listener
  ↓
1. Browser notification (system)
   [Đơn hàng mới]
   Bàn A1 cần xử lý
   
2. Custom toast popup
   ┌────────────────────────┐
   │ 🔔 Đơn hàng mới        │
   │    Bàn A1...       ✕  │
   │    Xem chi tiết →      │
   └────────────────────────┘
   
3. Sound: notification.mp3
```

#### **B. BACKGROUND (App không mở):**

**File:** `public/firebase-messaging-sw.js` (Service Worker)

```javascript
Backend gửi notification
  ↓
FCM → Service Worker
  ↓
onBackgroundMessage() handler
  ↓
Service Worker tự show notification:
  registration.showNotification(title, {
    body: 'Bàn A1...',
    icon: '/icon.png',
    data: { url: '/staff/orders/123' }
  })
  ↓
User click notification
  ↓
notificationclick event
  ↓
1. Close notification
2. Focus/Open window
3. Navigate to URL (nếu có)
```

---

### **2.3. NATIVE - Foreground & Background**

#### **A. FOREGROUND (App đang mở):**

```typescript
Backend gửi notification
  ↓
FCM → Capacitor Firebase Messaging Plugin
  ↓
FirebaseMessaging.addListener('notificationReceived')
  ↓
1. Set latestNotification state
2. Schedule LocalNotification (hiện trên thanh thông báo)
   LocalNotifications.schedule({
     title: 'Đơn hàng mới',
     body: 'Bàn A1...',
     extra: { url: '/staff/orders/123' }
   })
  ↓
NotificationProvider detect latestNotification
  ↓
Show custom toast (giống Web)
  ↓
Play sound
```

#### **B. BACKGROUND (App không mở hoặc ở background):**

```typescript
Backend gửi notification
  ↓
FCM → Native OS (iOS/Android)
  ↓
OS tự động show notification
  ↓
User click notification
  ↓
FirebaseMessaging.addListener('notificationActionPerformed')
  ↓
Navigate to URL:
  navigateToNotificationUrl(data.url, navigate)
```

---

## 🔄 PHASE 3: TOKEN LIFECYCLE MANAGEMENT

### **3.1. Token Refresh Scheduler**

**File:** `services/fcm-token-manager.ts`

```typescript
User login
  ↓
fcmTokenManager.startScheduler()
  ↓
setInterval(() => {
  checkAndRefreshToken()
}, 24 hours)
  ↓
Check:
  - Token đã đăng ký > 48h? → Refresh
  - Token thay đổi? → Unregister cũ, Register mới
```

---

### **3.2. App Lifecycle Events**

**File:** `hooks/use-app-lifecycle.ts` + `notification-provider.tsx`

```typescript
User minimize app → vào lại app
  ↓
useAppLifecycle() detect app resume
  ↓
Trigger: fcmTokenManager.checkAndRefreshToken()
  ↓
Check & refresh token nếu cần
```

**Or:**

```typescript
User switch tab → quay lại tab
  ↓
document.visibilitychange event
  ↓
visibilityHandler() in fcmTokenManager
  ↓
checkAndRefreshToken()
```

---

## 📤 PHASE 4: NAVIGATION TỪ NOTIFICATION

### **4.1. User Click "Xem chi tiết"**

**File:** `utils/notification-navigation.ts`

```typescript
User click button
  ↓
onClick() → navigateToNotificationUrl(url, navigate)
  ↓
Parse URL:
  - "/staff/orders/123" → Internal
  - "https://yourdomain.com/..." → Internal (same origin)
  - "https://google.com" → External
  ↓
Platform check:
  - Web → handleWebNavigation()
  - Native → handleNativeNavigation()
```

**Web Flow:**
```
Internal URL: /staff/orders/123
  ↓ navigate(path)
React Router navigation ✅
→ Không reload page
```

```
External URL: https://google.com
  ↓ window.open(url, '_blank')
New tab ✅
```

**Native Flow:**
```
Internal URL: /staff/orders/123
  ↓ navigate(path)
React Router navigation ✅
→ Same as Web
```

```
External URL: https://google.com
  ↓ Browser.open({ url })
InAppBrowser ✅
→ Mở browser TRONG app
→ User có toolbar để close
→ Quay lại app dễ dàng
```

---

## 🔄 PHASE 5: TOKEN RETRY LOGIC

### **5.1. Registration Failed (Network error)**

**File:** `services/token-registration-queue.ts`

```typescript
tokenRegistrationQueue.enqueue({ token, platform, userAgent })
  ↓
process() → Call API
  ↓
❌ Failed (network timeout)
  ↓
item.attempts++
  ↓
Retry #1 after 1s
  ↓
Still failed?
  ↓
Retry #2 after 5s
  ↓
Still failed?
  ↓
Retry #3 after 15s
  ↓
Still failed?
  ↓
Give up, log error
console.error('[TokenQueue] Max retries reached')
```

---

### **5.2. Network Back Online**

```typescript
User offline → Login attempt → Token registration queued but failed
  ↓
window 'online' event
  ↓
onlineHandler() in tokenRegistrationQueue
  ↓
retryAll()
  ↓
Reset attempts → Process queue again
  ↓
✅ Success
```

---

## 🧹 PHASE 6: CLEANUP (Logout)

**File:** `components/app/dialog/logout-dialog.tsx`

```typescript
User click "Đăng xuất"
  ↓
handleLogout()
  ↓
1. Unregister token từ backend
   await unregisterDeviceToken(deviceToken)
  ↓
2. Clear notification queue
   tokenRegistrationQueue.clearQueue()
  ↓
3. Stop scheduler
   fcmTokenManager.stopScheduler()
  ↓
4. Clear localStorage
   localStorage.removeItem('fcm_token')
   localStorage.removeItem('fcm_token_registered_at')
  ↓
5. Clear all stores (auth, user, cart...)
  ↓
6. Navigate to login page
```

---

## 🎯 COMPLETE FLOW DIAGRAM

### **Scenario: User nhận notification đơn hàng mới**

```
┌─────────────────────────────────────────────────────────┐
│ BACKEND                                                 │
├─────────────────────────────────────────────────────────┤
│ 1. Order mới được tạo                                   │
│ 2. Find user cần notify (role: staff)                  │
│ 3. Lấy FCM tokens của user                             │
│ 4. Gửi notification qua Firebase Admin SDK:            │
│    {                                                    │
│      notification: {                                    │
│        title: "Đơn hàng mới #12345",                   │
│        body: "Bàn A1 cần xử lý"                        │
│      },                                                 │
│      data: {                                            │
│        url: "/staff/orders/abc123",                    │
│        type: "order"                                    │
│      },                                                 │
│      token: user.fcmToken                              │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ FIREBASE CLOUD MESSAGING                                │
├─────────────────────────────────────────────────────────┤
│ 1. Nhận notification từ backend                        │
│ 2. Route đến device theo token                         │
│ 3. Push đến device qua APNs (iOS) hoặc FCM (Android)  │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ YOUR APP                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────┐         ┌──────────────┐              │
│ │ FOREGROUND  │         │  BACKGROUND  │              │
│ │ (App mở)    │         │  (App đóng)  │              │
│ └─────────────┘         └──────────────┘              │
│       ↓                        ↓                        │
│                                                         │
│ WEB:                    WEB:                           │
│ onMessage()             Service Worker                 │
│   ↓                     onBackgroundMessage()          │
│ 1. Browser notif         ↓                            │
│ 2. Custom toast       showNotification()              │
│ 3. Play sound            ↓                            │
│                       User click                       │
│                          ↓                            │
│                       Navigate to URL                  │
│                                                         │
│ NATIVE:                 NATIVE:                        │
│ FirebaseMessaging       OS shows notification          │
│ .notificationReceived      ↓                          │
│   ↓                     User click                     │
│ 1. LocalNotification       ↓                          │
│ 2. Custom toast        FirebaseMessaging              │
│ 3. Play sound          .notificationActionPerformed   │
│                           ↓                            │
│                        Navigate to URL                 │
└─────────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────┐
│ USER SEES                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. System notification (thanh thông báo)               │
│    [🔔] Đơn hàng mới #12345                            │
│         Bàn A1 cần xử lý                               │
│                                                         │
│ 2. Custom toast (nếu foreground)                       │
│    ┌────────────────────────────┐                      │
│    │ 🔔 Đơn hàng mới #12345 ✕  │                      │
│    │    Bàn A1 cần xử lý        │                      │
│    │    Xem chi tiết →          │                      │
│    └────────────────────────────┘                      │
│                                                         │
│ 3. Sound: 🔊 notification.mp3                          │
│                                                         │
│ 4. User click "Xem chi tiết"                           │
│    → Navigate to /staff/orders/abc123                  │
│    → Thấy chi tiết đơn hàng                            │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 FILE STRUCTURE & RESPONSIBILITIES

```
src/
├── firebase/
│   └── config.ts                    # Firebase init (Web only)
│
├── services/
│   ├── fcm-token-manager.ts         # Token refresh scheduler, visibility handler
│   └── token-registration-queue.ts  # Queue với retry logic
│
├── hooks/
│   ├── use-firebase-notification.ts # Lấy FCM token khi login
│   ├── use-notification-listener.ts # Lắng nghe notifications (foreground)
│   └── use-app-lifecycle.ts         # Detect app resume
│
├── utils/
│   ├── getWebFcmToken.ts           # Get token cho Web
│   ├── getNativeFcmToken.ts        # Get token cho Native
│   └── notification-navigation.ts   # Handle navigation từ notification
│
├── components/app/
│   └── notification-provider.tsx    # Root component quản lý notifications
│
├── app/layouts/
│   └── root-layout.tsx              # Wrap NotificationProvider
│
└── public/
    └── firebase-messaging-sw.js     # Service Worker (background Web)
```

---

## 🔄 DETAILED FLOWS

### **FLOW 1: WEB - FOREGROUND NOTIFICATION**

```
1. Backend gửi notification
   ↓
2. FCM push đến browser
   ↓
3. firebase-messaging-sw.js KHÔNG handle (vì app đang mở)
   ↓
4. onMessage() listener (use-notification-listener.ts) nhận
   ↓
5. Execute 3 actions:
   
   A. Browser Notification:
      new Notification(title, { body, icon, data })
      ↓
      Hiện trên thanh notification của OS
   
   B. Set state:
      setLatestNotification(payload)
      ↓
      Trigger useEffect trong NotificationProvider
   
   C. Custom Toast:
      toast.custom(<CustomUI />)
      ↓
      Hiện popup trong app
   
   D. Sound:
      new Audio(notificationSound).play()
```

---

### **FLOW 2: WEB - BACKGROUND NOTIFICATION**

```
1. User đóng app (close tab/window)
   ↓
2. Backend gửi notification
   ↓
3. FCM → Service Worker (firebase-messaging-sw.js)
   ↓
4. onBackgroundMessage() handler
   ↓
5. self.registration.showNotification(title, options)
   ↓
6. Browser shows notification (OS notification center)
   ↓
7. User click notification
   ↓
8. notificationclick event listener
   ↓
9. Check if window already open:
   
   A. Window exists with matching URL?
      → client.focus() (focus window đó)
   
   B. No matching window?
      → clients.openWindow(url) (mở window/tab mới)
```

---

### **FLOW 3: NATIVE - FOREGROUND NOTIFICATION**

```
1. Backend gửi notification
   ↓
2. FCM → Native OS → Capacitor Plugin
   ↓
3. FirebaseMessaging.addListener('notificationReceived')
   ↓
4. Execute 2 actions:
   
   A. LocalNotification (hiện trên thanh thông báo):
      LocalNotifications.schedule({
        title: 'Đơn hàng mới',
        body: 'Bàn A1...',
        extra: { url: '/staff/orders/123' }
      })
   
   B. Set state:
      setLatestNotification(data)
      ↓
      Trigger useEffect → Custom toast
      ↓
      Play sound
```

---

### **FLOW 4: NATIVE - BACKGROUND NOTIFICATION**

```
1. User minimize app (Home button)
   ↓
2. Backend gửi notification
   ↓
3. FCM → iOS/Android OS
   ↓
4. OS automatically shows notification (không qua app)
   ↓
5. User click notification
   ↓
6. OS opens app (nếu đóng) hoặc brings to foreground
   ↓
7. FirebaseMessaging.addListener('notificationActionPerformed')
   ↓
8. Get data.url
   ↓
9. navigateToNotificationUrl(url, navigate)
   ↓
10. Navigate to order detail page
```

---

## 🔀 NAVIGATION FLOW (Chi tiết)

### **URL: "/staff/orders/abc123"**

```typescript
User click "Xem chi tiết"
  ↓
navigateToNotificationUrl("/staff/orders/abc123", navigate)
  ↓
Console logs:
  🔗 [Navigation] Platform: web URL: /staff/orders/abc123
  ↓
parseNotificationUrl("/staff/orders/abc123")
  ↓
Result: {
  isInternal: true,
  path: "/staff/orders/abc123",
  fullUrl: "/staff/orders/abc123"
}
  ↓
Platform === 'web'?
  ├─ YES → handleWebNavigation()
  │         ↓
  │       isInternal? → navigate("/staff/orders/abc123")
  │         ↓
  │       React Router navigates to OrderDetailPage
  │         ↓
  │       URL changes, page renders
  │
  └─ NO (Native) → handleNativeNavigation()
              ↓
            isInternal? → navigate("/staff/orders/abc123")
              ↓
            React Router navigates (same as Web)
```

---

### **URL: "https://google.com"**

```typescript
navigateToNotificationUrl("https://google.com", navigate)
  ↓
parseNotificationUrl("https://google.com")
  ↓
Result: {
  isInternal: false,      // Different origin
  path: "/",
  fullUrl: "https://google.com"
}
  ↓
Platform === 'web'?
  ├─ YES → window.open("https://google.com", "_blank")
  │         ↓
  │       Opens new browser tab ✅
  │
  └─ NO (Native) → Browser.open({ url: "https://google.com" })
              ↓
            InAppBrowser opens ✅
            ┌────────────────────────┐
            │ ← Back    google.com   │ ← Toolbar
            ├────────────────────────┤
            │                        │
            │   Google homepage      │
            │                        │
            └────────────────────────┘
            User click Back → Quay lại app
```

---

## 🔧 TOKEN REFRESH FLOW

### **Token cũ hơn 48 giờ:**

```typescript
fcmTokenManager scheduler chạy (mỗi 24h)
  ↓
checkAndRefreshToken()
  ↓
Get: localStorage.fcm_token_registered_at
  ↓
Calculate: elapsed = now - registeredAt
  ↓
elapsed > 48h?
  ├─ NO → Skip
  │
  └─ YES → Refresh token
         ↓
       Get new token:
         - Web: getWebFcmToken()
         - Native: getNativeFcmToken()
         ↓
       Token changed?
         ├─ NO → Update timestamp only
         │
         └─ YES → 
              1. unregisterDeviceToken(oldToken)
              2. registerDeviceToken(newToken)
              3. Update userStore
              4. Update localStorage
```

---

## 🎬 EXAMPLE: COMPLETE JOURNEY

### **User Story: Staff nhận notification đơn hàng mới**

```
[10:00 AM] User login vào app
  ↓
Login successful
  ↓
getWebFcmToken() → "token_abc123..."
  ↓
tokenRegistrationQueue.enqueue({ token, platform: 'web' })
  ↓
API: POST /notification/firebase/register-device-token
  ↓
✅ Token registered successfully
  ↓
Save: localStorage.fcm_token = "token_abc123..."
      localStorage.fcm_token_registered_at = "1730448000000"
  ↓
fcmTokenManager.startScheduler() → Check mỗi 24h
  ↓
useNotificationListener() setup → Sẵn sàng nhận notifications

─────────────────────────────────────────────────────────

[10:30 AM] Customer đặt đơn hàng mới
  ↓
Backend tạo order #12345
  ↓
Backend gửi notification đến staff:
  {
    notification: { title: "Đơn hàng mới #12345", body: "Bàn A1" },
    data: { url: "/staff/orders/abc123", type: "order" }
  }
  ↓
FCM push đến browser (app đang mở - foreground)
  ↓
onMessage() listener nhận
  ↓
3 things happen simultaneously:

  1. Browser notification:
     [🔔] Đơn hàng mới #12345
          Bàn A1 cần xử lý
  
  2. Custom toast appears:
     ┌────────────────────────────┐
     │ 🔔 Đơn hàng mới #12345 ✕  │
     │    Bàn A1 cần xử lý        │
     │    Xem chi tiết →          │
     └────────────────────────────┘
  
  3. Sound plays: 🔊 notification.mp3
  
  ↓
Staff click "Xem chi tiết"
  ↓
Console logs:
  🔔 [Notification Click] URL: /staff/orders/abc123
  🔗 [Navigation] Platform: web URL: /staff/orders/abc123
  🔗 [Web] Internal navigation: /staff/orders/abc123
  ↓
navigate("/staff/orders/abc123")
  ↓
React Router → OrderDetailPage component
  ↓
Staff thấy chi tiết đơn hàng #12345
  ↓
Staff xử lý đơn hàng ✅

─────────────────────────────────────────────────────────

[11:00 PM] User logout
  ↓
handleLogout()
  ↓
1. unregisterDeviceToken("token_abc123...")
   → Backend xóa token khỏi database
  ↓
2. tokenRegistrationQueue.clearQueue()
   → Clear pending registrations
  ↓
3. fcmTokenManager.stopScheduler()
   → Stop scheduler, remove listeners
  ↓
4. localStorage.removeItem('fcm_token')
   localStorage.removeItem('fcm_token_registered_at')
  ↓
5. Clear all stores
  ↓
Navigate to login page
  ↓
✅ Cleanup complete
```

---

## 🧪 HOW TO TEST

### **Test 1: Foreground Notification (Web)**

1. Login vào app
2. Mở DevTools Console
3. Gửi test notification từ Firebase Console hoặc backend
4. Expect:
   ```
   Console:
   🔔 [Notification Received] { title: "...", data: {...} }
   
   UI:
   - Browser notification (top right OS)
   - Custom toast (in-app)
   - Sound plays
   ```
5. Click "Xem chi tiết"
6. Expect:
   ```
   Console:
   🔔 [Notification Click] URL: /staff/orders/abc123
   🔗 [Navigation] Platform: web URL: /staff/orders/abc123
   🔗 [Web] Internal navigation: /staff/orders/abc123
   
   UI:
   - Navigate to order detail page
   - No page reload
   ```

---

### **Test 2: Background Notification (Web)**

1. Login vào app
2. Close tab
3. Gửi notification
4. Expect: Browser notification xuất hiện
5. Click notification
6. Expect: 
   - Tab mở lại (hoặc tab mới)
   - Navigate to URL

---

### **Test 3: Native App**

1. Build app: `npx cap sync android`
2. Run trên Android Studio/Xcode
3. Login
4. Console:
   ```
   [FCM Native] Token: token_xyz...
   ```
5. Gửi notification
6. Expect:
   - Foreground: Local notification + Custom toast + Sound
   - Background: OS notification
7. Click notification → Navigate to URL

---

## 🔍 DEBUGGING TIPS

### **Check Token:**
```javascript
// Console
localStorage.getItem('fcm_token')
// → "eXyZ123abc..."

localStorage.getItem('fcm_token_registered_at')
// → "1730448000000"
```

### **Check Queue:**
```javascript
// Console
tokenRegistrationQueue.getQueueStatus()
// → { length: 0, isProcessing: false, items: [] }
```

### **Check Scheduler:**
```javascript
// Console
fcmTokenManager
// Should see: intervalId not null if running
```

---

## ⚙️ CONFIGURATION

### **Environment Variables:**

```env
# .env
VITE_FIREBASE_VAPID_KEY=BK9CjXq...  # Web push certificate key
```

### **Firebase Config:**

```typescript
// firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "order-notification-dev.firebaseapp.com",
  projectId: "order-notification-dev",
  ...
}
```

### **Capacitor Config:**

```typescript
// capacitor.config.ts
{
  appId: 'com.trendcoffee.app',
  appName: 'TREND Coffee',
  plugins: {
    // Firebase Messaging auto-configured via google-services.json
  }
}
```

---

## 🎯 KEY POINTS

1. **Token Registration:**
   - Happens on login
   - Saved to localStorage
   - Synced with backend
   - Auto-refresh every 48h

2. **Listeners:**
   - Setup once per app session
   - Cleanup on unmount
   - No memory leaks

3. **Navigation:**
   - Auto-detect platform
   - Internal: React Router
   - External: New tab (Web) / InAppBrowser (Native)

4. **Retry Logic:**
   - Queue-based
   - Exponential backoff
   - Auto-retry on network recovery

5. **Cleanup:**
   - Logout unregisters token
   - Clears queue & localStorage
   - Stops scheduler

---

## 📱 PLATFORM DIFFERENCES

| Feature | Web | Native |
|---------|-----|--------|
| **Init** | Firebase Web SDK | Capacitor Plugin |
| **Permission** | `Notification.requestPermission()` | `FirebaseMessaging.requestPermissions()` |
| **Token** | Via Service Worker | Via Native SDK |
| **Foreground** | `onMessage()` | `notificationReceived` event |
| **Background** | Service Worker | OS + Plugin |
| **Sound** | Web Audio API | Native notification sound |
| **Navigation** | React Router | React Router (same) |
| **External URLs** | `window.open()` | `Browser.open()` (InAppBrowser) |

---

## 🚀 PRODUCTION CHECKLIST

- [ ] Remove console.logs or use proper logger
- [ ] Test trên real devices (iOS/Android)
- [ ] Test notification khi app killed
- [ ] Test retry logic (offline scenario)
- [ ] Test navigation (internal/external URLs)
- [ ] Verify token refresh scheduler
- [ ] Verify logout cleanup
- [ ] Check memory usage (no leaks)

---

**Bây giờ bạn hiểu rõ toàn bộ notification system rồi!** 🎉

