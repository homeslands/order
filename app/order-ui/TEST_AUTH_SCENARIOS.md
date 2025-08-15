# 🧪 Auth Fix Test Scenarios

Hướng dẫn test các scenario để validate fix cho bug redirect loop khi expired token.

## 🎯 **Test Objectives**

Đảm bảo rằng sau khi apply fix:

1. Expired tokens được cleanup properly
2. Login page hiển thị form thay vì redirect về home
3. Monitoring logs hoạt động đúng
4. Không có race conditions

---

## 🛠️ **Setup Test Environment**

### 1. Start Development Server

```bash
npm run dev
# hoặc yarn dev
```

### 2. Open Browser Console

- Mở DevTools (F12)
- Navigate to Console tab
- Test functions sẽ available tại `window.testAuth`

---

## 📋 **Test Cases**

### **Test Case 1: Expired Token Scenario (Main Bug)**

**Mục tiêu:** Reproduce bug ban đầu và verify fix

**Steps:**

1. **Setup expired data:**

   ```javascript
   // Trong browser console:
   window.testAuth.simulateExpiredTokenScenario()
   ```

2. **Refresh page:**

   ```javascript
   window.location.reload()
   ```

3. **Navigate to login:**
   ```javascript
   window.location.href = '/auth/login'
   ```

**Expected Result:**

- ✅ App initialization logs expired token detection
- ✅ Login page shows form (NOT redirect to home)
- ✅ Console shows monitoring logs
- ✅ No navigation loop

**Fail Indicators:**

- ❌ Redirects to home instead of showing login form
- ❌ Navigation loop detected logs
- ❌ No cleanup logs in console

---

### **Test Case 2: Valid Token Scenario**

**Mục tiêu:** Đảm bảo valid tokens vẫn redirect properly

**Steps:**

1. **Clean previous data:**

   ```javascript
   window.testAuth.cleanAuthData()
   ```

2. **Setup valid tokens:**

   ```javascript
   window.testAuth.simulateValidTokenScenario()
   ```

3. **Navigate to login:**
   ```javascript
   window.location.href = '/auth/login'
   ```

**Expected Result:**

- ✅ Automatically redirects to home (/)
- ✅ No expired token logs
- ✅ Navigation logs show successful redirect

---

### **Test Case 3: Fresh Install (Empty localStorage)**

**Mục tiêu:** Test clean state behavior

**Steps:**

1. **Clean all data:**

   ```javascript
   window.testAuth.cleanAuthData()
   ```

2. **Navigate to login:**
   ```javascript
   window.location.href = '/auth/login'
   ```

**Expected Result:**

- ✅ Shows login form immediately
- ✅ No auth-related logs (clean state)
- ✅ isReadyToNavigate = false

---

### **Test Case 4: Race Condition Test**

**Mục tiêu:** Test multiple rapid navigations

**Steps:**

1. **Setup expired tokens:**

   ```javascript
   window.testAuth.simulateExpiredTokenScenario()
   ```

2. **Rapid navigation:**
   ```javascript
   // Rapid fire navigation (simulates fast user interaction)
   for (let i = 0; i < 5; i++) {
     setTimeout(() => {
       window.location.href = '/auth/login'
     }, i * 100)
   }
   ```

**Expected Result:**

- ✅ Eventually shows login form
- ✅ No infinite loops
- ✅ Cleanup logs appear only once per session

---

## 📊 **Monitoring Validation**

### **Console Logs to Look For:**

**✅ Success Indicators:**

```
🔐 Auth Issue Detected: {location: "App Initialization", ...}
🔐 Auth Issue Detected: {location: "Login Component Mount", ...}
🧭 Auth Navigation: {from: "/auth/login", to: "/", reason: "...", ...}
```

**❌ Failure Indicators:**

```
🔐 Auth Issue Detected: {reason: "Navigation loop detected", ...}
Warning: Cannot update during an existing state transition
Maximum update depth exceeded
```

---

## 🔧 **Advanced Testing**

### **Manual Token Manipulation:**

```javascript
// Check current auth state
const authStore = useAuthStore.getState()
console.log('Auth State:', {
  hasToken: !!authStore.token,
  isAuthenticated: authStore.isAuthenticated(),
  isTokenValid: authStore.isTokenValid(),
})

// Manually expire tokens
localStorage.setItem(
  'auth-storage',
  JSON.stringify({
    state: {
      token: 'expired_token',
      refreshToken: 'expired_refresh',
      expireTime: '2020-01-01T00:00:00Z',
      expireTimeRefreshToken: '2020-01-01T00:00:00Z',
      isRefreshing: false,
    },
    version: 0,
  }),
)
```

### **Network Simulation:**

Test với slow network để simulate real-world conditions:

1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Run test scenarios

---

## 📝 **Test Checklist**

- [ ] **Test Case 1 passed** - Expired tokens show login form
- [ ] **Test Case 2 passed** - Valid tokens redirect properly
- [ ] **Test Case 3 passed** - Clean state works correctly
- [ ] **Test Case 4 passed** - No race conditions
- [ ] **Monitoring logs** - All expected logs appear
- [ ] **No console errors** - Clean execution
- [ ] **Performance** - No excessive re-renders
- [ ] **Multiple tabs** - Consistent behavior across tabs

---

## 🆘 **Troubleshooting**

### **If tests fail:**

1. **Check browser compatibility:**

   - Test in Chrome, Firefox, Safari
   - Check localStorage support

2. **Clear all data:**

   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   window.location.reload()
   ```

3. **Check imports:**

   - Verify auth-monitoring.ts exports properly
   - Check utils/index.ts includes new exports

4. **Check environment:**
   - Ensure NODE_ENV !== 'production'
   - Verify moment.js is available

### **Performance Issues:**

- Monitor with React DevTools Profiler
- Check for excessive re-renders in Login component
- Verify useEffect dependencies are correct

---

## 📈 **Success Criteria**

Fix is considered successful when:

1. ✅ All test cases pass consistently
2. ✅ No more redirect loops with expired tokens
3. ✅ Monitoring provides useful debug info
4. ✅ No performance regressions
5. ✅ Works across different browsers/devices

Happy testing! 🚀
