# Token Handling & Remember Me Feature

## Overview
This feature implements secure token-based authentication with automatic token refresh and "Remember Me" functionality.

## Features

### 1. **Dual Token System**
- **Access Token**: Short-lived (15 minutes) - Used for API requests
- **Refresh Token**: Long-lived (7 days / 30 days with Remember Me) - Stored in database

### 2. **Remember Me**
- When checked: Session lasts 30 days
- When unchecked: Session lasts 7 days
- Refresh token stored securely in database with device info

### 3. **Automatic Token Refresh**
- Axios interceptor automatically refreshes expired access tokens
- No user interruption - seamless experience
- Failed requests are queued and retried after refresh

### 4. **Security Features**
- Refresh tokens stored in database (not just JWT)
- Device tracking (IP address, User Agent)
- Token revocation on logout
- Automatic cleanup of expired tokens (daily at 2 AM)
- Single session per user (can be changed to multi-device)

## Backend Implementation

### New Files Created:
1. **RefreshToken.java** - Entity for storing refresh tokens
2. **RefreshTokenRepository.java** - Database operations
3. **RefreshTokenService.java** - Business logic with scheduled cleanup
4. **Updated JwtService.java** - Separate access/refresh token generation
5. **Updated AuthController.java** - New endpoints for refresh and logout

### API Endpoints:

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": true
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "roles": ["ROLE_EMPLOYEE"],
  "accessTokenExpiresIn": 900000,
  "refreshTokenExpiresIn": 2592000000,
  "rememberMe": true
}
```

#### POST /auth/refresh
**Request:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "roles": ["ROLE_EMPLOYEE"],
  "expiresIn": 900000
}
```

#### POST /auth/logout
**Request:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/validate
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "valid": true,
  "expired": false
}
```

## Frontend Implementation

### Updated Files:
1. **AxiosInstance.js** - Interceptor for auto-refresh
2. **Login.js** - Remember Me checkbox integration
3. **AuthContext.js** - Logout with backend call
4. **App.js** - Token expiration monitor
5. **Logout.js** - New component for graceful logout

### How It Works:

#### 1. Login Flow
```javascript
// User checks "Remember Me" and logs in
POST /auth/login { email, password, rememberMe: true }

// Response stored in localStorage:
localStorage.setItem("token", accessToken);           // 15 min
localStorage.setItem("refreshToken", refreshToken);   // 30 days
localStorage.setItem("tokenExpiresAt", Date.now() + 900000);
localStorage.setItem("rememberMe", "true");
```

#### 2. API Request with Expired Token
```javascript
// User makes API call after 16 minutes (token expired)
GET /hr/employees

// Axios interceptor catches 401 error
// Automatically calls:
POST /auth/refresh { refreshToken }

// Gets new access token
// Retries original request with new token
// User sees no interruption!
```

#### 3. Logout Flow
```javascript
// User clicks logout
// Calls backend to revoke refresh token
POST /auth/logout { refreshToken }

// Clears localStorage
// Redirects to login page
```

## Database Schema

### refresh_token Table
```sql
CREATE TABLE refresh_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    remember_me BOOLEAN NOT NULL DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES user_auth(user_id)
);
```

## Configuration

### Backend (application.properties)
```properties
# JWT Secret (must be 32+ characters)
hrms.jwt.secret=ChangeThisToLongRandomKeyOf32CharsOrMore

# CORS (add your frontend URL)
app.cors.allowed-origins=http://localhost:3000

# Enable scheduling for token cleanup
spring.task.scheduling.enabled=true
```

### Token Expiration Times (JwtService.java)
```java
private static final long ACCESS_TOKEN_EXP_MS = 15 * 60 * 1000;              // 15 minutes
private static final long REFRESH_TOKEN_EXP_MS = 7 * 24 * 60 * 60 * 1000;    // 7 days
private static final long REFRESH_TOKEN_REMEMBER_ME_EXP_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
```

## Security Considerations

### ✅ Implemented Security Measures:
1. **Refresh tokens stored in database** - Can be revoked immediately
2. **Device tracking** - IP address and User Agent logged
3. **Automatic token expiration** - Old tokens cleaned up daily
4. **Single session enforcement** - New login revokes old tokens (configurable)
5. **Secure token generation** - UUID for refresh tokens, JWT for access tokens
6. **Token validation** - Both expiration and revocation checked

### ⚠️ Additional Recommendations:
1. Use HTTPS in production
2. Enable rate limiting on auth endpoints
3. Add CAPTCHA for repeated failed logins
4. Implement account lockout after X failed attempts
5. Log all authentication events for audit

## Testing

### Manual Testing Steps:

1. **Test Remember Me ON:**
   ```
   - Login with "Remember Me" checked
   - Wait 16 minutes
   - Make any API request
   - Should auto-refresh without logout
   - Token valid for 30 days
   ```

2. **Test Remember Me OFF:**
   ```
   - Login without "Remember Me"
   - Wait 16 minutes
   - Make any API request
   - Should auto-refresh without logout
   - Token valid for 7 days
   ```

3. **Test Token Expiration:**
   ```
   - Login
   - Open DevTools > Application > Local Storage
   - Delete "refreshToken"
   - Wait 16 minutes
   - Make any API request
   - Should redirect to login (no refresh token)
   ```

4. **Test Logout:**
   ```
   - Login
   - Click logout
   - Check database: refresh_token.revoked_at should be set
   - Try to refresh with old token
   - Should fail with "token expired or revoked"
   ```

## Troubleshooting

### Issue: "Refresh token is expired or revoked"
**Solution:** User needs to login again. Refresh token was either:
- Expired (7 or 30 days passed)
- Manually revoked
- User logged in from another device (single session mode)

### Issue: "Invalid refresh token"
**Solution:** Token not found in database. Possible causes:
- Token was deleted by cleanup job
- Database was reset
- User needs to login again

### Issue: Token refresh loop (constant 401s)
**Solution:** Check:
1. Backend is running and accessible
2. CORS configuration allows frontend origin
3. JWT secret is correct and same across restarts
4. Refresh token endpoint is not protected by JWT filter

## Migration Guide

### Step 1: Run Database Migration
```bash
mysql -u hrms_user -p hrms_dev < backend/scripts/add_refresh_token_table.sql
```

### Step 2: Restart Backend
```bash
cd backend
mvn spring-boot:run
```

### Step 3: Clear Old Sessions (Frontend)
```javascript
// All users need to re-login once
// Old tokens won't have refresh tokens
localStorage.clear();
```

### Step 4: Test
- Login with Remember Me
- Verify token refresh works
- Check database for refresh_token entries

## Maintenance

### View Active Sessions
```sql
SELECT 
    u.email,
    rt.token,
    rt.created_at,
    rt.expires_at,
    rt.remember_me,
    rt.ip_address,
    rt.user_agent
FROM refresh_token rt
JOIN user_auth u ON rt.user_id = u.user_id
WHERE rt.revoked_at IS NULL
  AND rt.expires_at > NOW()
ORDER BY rt.created_at DESC;
```

### Revoke All User Sessions
```sql
UPDATE refresh_token 
SET revoked_at = NOW() 
WHERE user_id = ? AND revoked_at IS NULL;
```

### Manual Cleanup (if scheduled job fails)
```sql
DELETE FROM refresh_token 
WHERE expires_at < NOW();
```

## Future Enhancements

1. **Multi-Device Support**
   - Remove `revokeAllUserTokens` call in login
   - Show active sessions in user profile
   - Allow user to revoke specific devices

2. **Push Notifications**
   - Notify user of new login from unknown device
   - Alert before token expiration

3. **Token Rotation**
   - Issue new refresh token on each refresh
   - Implement refresh token families for security

4. **Session Activity**
   - Track last activity timestamp
   - Show "last seen" in user profile

## Support

For issues or questions:
1. Check backend logs for authentication errors
2. Check browser console for frontend errors
3. Verify database refresh_token table exists
4. Ensure JWT secret is configured correctly
