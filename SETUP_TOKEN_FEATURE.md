# Quick Setup: Token Handling & Remember Me

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Database Migration
```powershell
# Navigate to backend folder
cd e:\v2\hrms-pgis\backend

# Run the SQL script
mysql -u hrms_user -p hrms_dev < scripts\add_refresh_token_table.sql
# Enter password: SuperSecret123!
```

### Step 2: Restart Backend Server
```powershell
# If backend is running, stop it (Ctrl+C)
# Then restart:
mvn clean spring-boot:run
```

### Step 3: Clear Frontend Cache (IMPORTANT!)
Open browser DevTools (F12):
```javascript
// In Console tab, run:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 4: Restart Frontend (if running)
```powershell
# Navigate to frontend folder
cd e:\v2\hrms-pgis

# Restart React app
npm start
```

## ✅ Test the Feature

### Test 1: Remember Me (2 minutes)
1. Go to http://localhost:3000
2. Login with: `admin@test.com` / `password`
3. ✅ **CHECK "Remember Me"** checkbox
4. Click "Sign In"
5. Open DevTools → Application → Local Storage
6. Verify you see:
   - `token` (access token)
   - `refreshToken` (refresh token)
   - `tokenExpiresAt` (timestamp)
   - `rememberMe` = "true"

### Test 2: Auto Token Refresh (1 minute)
1. Stay logged in
2. Open DevTools → Network tab
3. Wait 16 minutes (or manually expire token in DB)
4. Click any menu item
5. ✅ Should see `/auth/refresh` call in Network tab
6. Page should load normally (no logout!)

### Test 3: Logout (30 seconds)
1. Click logout
2. Check Network tab
3. ✅ Should see `/auth/logout` call
4. Check database:
```sql
SELECT * FROM refresh_token WHERE revoked_at IS NOT NULL;
```
5. ✅ Should see revoked_at timestamp

## 🔍 Verify Installation

### Backend Checklist:
```powershell
# 1. Check if table exists
mysql -u hrms_user -p hrms_dev -e "DESCRIBE refresh_token;"

# 2. Check backend logs for startup
# Look for: "Started HrmsApplication"
# No errors about RefreshToken or scheduling
```

### Frontend Checklist:
1. Login page shows "Remember me for 30 days" checkbox
2. No console errors
3. Token stored in localStorage after login
4. Axios interceptor configured (check network on 401)

## 📊 Monitor Active Sessions

```sql
-- See all active sessions
SELECT 
    u.email,
    rt.remember_me,
    rt.created_at,
    rt.expires_at,
    rt.ip_address
FROM refresh_token rt
JOIN user_auth u ON rt.user_id = u.user_id
WHERE rt.revoked_at IS NULL
  AND rt.expires_at > NOW();
```

## 🐛 Common Issues

### Issue: "refresh_token table doesn't exist"
```powershell
# Run migration again
mysql -u hrms_user -p hrms_dev < backend\scripts\add_refresh_token_table.sql
```

### Issue: "401 Unauthorized" loop
1. Clear localStorage: `localStorage.clear()`
2. Restart backend server
3. Login again

### Issue: Backend won't start
Check for:
- Missing `@EnableScheduling` annotation
- Import errors in new files
- Database connection issues

### Issue: Frontend errors
```powershell
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

## 🎯 What Changed?

### Backend Files Added:
- ✅ `RefreshToken.java` - Entity
- ✅ `RefreshTokenRepository.java` - Database
- ✅ `RefreshTokenService.java` - Business logic
- ✅ `add_refresh_token_table.sql` - Migration

### Backend Files Modified:
- ✅ `JwtService.java` - Access + refresh tokens
- ✅ `AuthController.java` - New endpoints
- ✅ `HrmsApplication.java` - Enable scheduling

### Frontend Files Added:
- ✅ `Logout.js` - Logout component
- ✅ `TokenExpirationMonitor.jsx` - Token monitor

### Frontend Files Modified:
- ✅ `AxiosInstance.js` - Auto-refresh interceptor
- ✅ `Login.js` - Remember Me UI
- ✅ `AuthContext.js` - Logout backend call
- ✅ `App.js` - Added monitor + logout route

## 📝 Configuration Summary

| Setting | Value | Location |
|---------|-------|----------|
| Access Token Expiry | 15 minutes | JwtService.java |
| Refresh Token Expiry | 7 days | JwtService.java |
| Remember Me Expiry | 30 days | JwtService.java |
| Token Cleanup | Daily 2 AM | RefreshTokenService.java |
| Session Mode | Single device | RefreshTokenService.java |

## 🎓 How to Use (User Guide)

### For Users:
1. **Login normally** - Session lasts 7 days
2. **Check "Remember Me"** - Session lasts 30 days
3. **Stay logged in** - Token auto-refreshes every 15 min
4. **Logout** - Invalidates all tokens immediately

### For Developers:
1. All API calls automatically include Bearer token
2. 401 errors trigger auto-refresh (transparent to code)
3. Failed refresh redirects to login
4. Use `useAuth()` hook for logout: `logout()`

## 🔒 Security Notes

✅ **What's Secure:**
- Refresh tokens stored in database (revocable)
- Device tracking (IP, User Agent)
- Automatic cleanup of old tokens
- Single session per user (optional)

⚠️ **Production Requirements:**
- Use HTTPS (not HTTP)
- Change JWT secret in production
- Enable rate limiting
- Add CAPTCHA for auth endpoints
- Set up proper CORS origins

## 📞 Quick Help Commands

```powershell
# Check backend health
curl http://localhost:8080/auth/validate

# Check database
mysql -u hrms_user -p hrms_dev -e "SELECT COUNT(*) FROM refresh_token;"

# View backend logs
cd backend
mvn spring-boot:run

# View frontend logs
cd frontend
npm start

# Clear everything and start fresh
mysql -u hrms_user -p hrms_dev -e "TRUNCATE TABLE refresh_token;"
```

## ✨ Done!

Your HRMS now has:
- ✅ Secure token-based authentication
- ✅ Automatic token refresh
- ✅ "Remember Me" for 30 days
- ✅ Proper logout with token revocation
- ✅ Session management and cleanup

**Next Steps:**
1. Test thoroughly with different users
2. Monitor refresh_token table growth
3. Set up production JWT secret
4. Configure HTTPS for production
5. Add rate limiting (optional)

**Need Help?**
- Check `TOKEN_HANDLING_README.md` for detailed docs
- Review backend logs for errors
- Check browser console for frontend issues
