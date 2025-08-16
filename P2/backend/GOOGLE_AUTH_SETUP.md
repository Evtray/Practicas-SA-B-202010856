# 🔐 Google Authenticator Setup Guide

## 📱 Prerequisites

1. **Install Google Authenticator** on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/google-authenticator/id388497605)
   - [Google Play Store](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)

## 🚀 Setup Process

### Step 1: Enable 2FA in Your Account

1. Login to your account
2. Call the setup endpoint:

```bash
POST /api/auth/setup-2fa
Authorization: Cookie (access_token)
```

### Step 2: Configure Google Authenticator

The response will include:

```json
{
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP...",
  "appName": "AuthSystem",
  "backupCodes": ["XXXX-XXXX", ...],
  "instructions": {
    "step1": "Install Google Authenticator on your phone",
    "step2": "Open the app and tap the + button",
    "step3": "Select 'Scan a QR code' and scan the code below",
    "step4": "Or select 'Enter a setup key' and enter the manual key",
    "step5": "Enter the 6-digit code from the app to confirm"
  }
}
```

### Step 3: Add Account to Google Authenticator

#### Option A: Scan QR Code (Recommended)
1. Open Google Authenticator
2. Tap the **+** button (bottom right)
3. Select **"Scan a QR code"**
4. Point your camera at the QR code displayed
5. The account will be added automatically

#### Option B: Manual Entry
1. Open Google Authenticator
2. Tap the **+** button
3. Select **"Enter a setup key"**
4. Enter:
   - **Account**: Your email address
   - **Key**: The `manualEntryKey` from the response
   - **Type**: Keep as "Time based"
5. Tap **Add**

### Step 4: Verify Setup

1. Google Authenticator will show a 6-digit code
2. Submit this code to confirm:

```bash
POST /api/auth/confirm-2fa
Authorization: Cookie (access_token)
Content-Type: application/json

{
  "code": "123456"
}
```

### Step 5: Save Backup Codes

**IMPORTANT**: Save the backup codes in a secure location. These can be used if you lose access to Google Authenticator.

## 🔑 Using Google Authenticator for Login

### Normal Login Flow with 2FA

1. **Initial Login**:
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "requiresTwoFactor": true,
  "tempToken": "temp-token-xxx",
  "userId": "user-id-xxx"
}
```

2. **Submit Google Authenticator Code**:
```bash
POST /api/auth/verify-2fa
{
  "tempToken": "temp-token-xxx",
  "userId": "user-id-xxx",
  "code": "123456"
}
```

## 🛠️ Troubleshooting

### "Invalid Code" Error

1. **Check Time Synchronization**:
   - Ensure your phone's time is set to automatic
   - Google Authenticator relies on accurate time

2. **Wait for New Code**:
   - Codes refresh every 30 seconds
   - Try the next code when it appears

3. **Re-scan QR Code**:
   - Delete the account from Google Authenticator
   - Re-scan the QR code

### Lost Access to Google Authenticator

1. **Use Backup Codes**:
   - Each backup code can be used once
   - Contact support if all codes are exhausted

2. **Disable 2FA** (if logged in):
```bash
DELETE /api/users/2fa
{
  "password": "yourpassword"
}
```

## 📊 Technical Details

- **Algorithm**: TOTP (Time-based One-Time Password)
- **Hash**: SHA-1 (Google Authenticator standard)
- **Digits**: 6
- **Period**: 30 seconds
- **Encoding**: Base32

## 🔒 Security Best Practices

1. **Never share your setup QR code or secret key**
2. **Store backup codes in a password manager**
3. **Enable screen lock on your phone**
4. **Consider using multiple 2FA methods**
5. **Regularly review account security**

## 📱 Compatible Apps

While optimized for Google Authenticator, our 2FA system is compatible with:
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator
- Any TOTP-compatible app

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Verify your device time settings
3. Try using a backup code
4. Contact support@yourdomain.com