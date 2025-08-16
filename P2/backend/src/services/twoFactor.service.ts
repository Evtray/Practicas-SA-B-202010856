import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from '../config/env';
import { EmailService } from './email.service';

const prisma = new PrismaClient();

export class TwoFactorService {
  static async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new Error('2FA is already enabled');
    }

    // Generate secret optimized for Google Authenticator
    const secret = speakeasy.generateSecret({
      name: config.twoFA.appName, // App name that appears in Google Authenticator
      issuer: config.twoFA.appName, // Issuer for better Google Auth compatibility
      length: 32, // 32 bytes for maximum security
    });

    // Add user email to the label for clarity in Google Authenticator
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${config.twoFA.appName}:${user.email}`,
      issuer: config.twoFA.appName,
      encoding: 'base32',
      algorithm: 'sha1', // Google Authenticator uses SHA1
      digits: 6, // Google Authenticator standard
      period: 30, // 30 seconds period (Google Auth default)
    });

    // Generate QR code optimized for Google Authenticator scanning
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 250, // Optimal size for mobile scanning
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    // Temporarily store the secret (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
      },
    });

    // Send backup codes via email
    await EmailService.send2FABackupCodes(user.email, backupCodes);

    return {
      qrCode: qrCodeUrl,
      secret: secret.base32,
      manualEntryKey: secret.base32, // For manual entry in Google Authenticator
      appName: config.twoFA.appName,
      backupCodes,
      instructions: {
        step1: 'Install Google Authenticator on your phone',
        step2: 'Open the app and tap the + button',
        step3: 'Select "Scan a QR code" and scan the code below',
        step4: 'Or select "Enter a setup key" and enter the manual key',
        step5: 'Enter the 6-digit code from the app to confirm',
      },
    };
  }

  static async verify2FASetup(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new Error('2FA setup not initiated');
    }

    // Validate code format (Google Authenticator generates 6 digits)
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Code must be exactly 6 digits');
    }

    // Verify the code with Google Authenticator compatible settings
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      digits: 6, // Google Authenticator standard
      algorithm: 'sha1', // Google Authenticator uses SHA1
      window: 1, // Allow 1 time step before/after (30 seconds tolerance)
    });

    if (!verified) {
      throw new Error('Invalid code. Make sure your Google Authenticator time is synchronized');
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    return { 
      message: '2FA with Google Authenticator enabled successfully',
      reminder: 'Save your backup codes in a safe place'
    };
  }

  static async verify2FA(userId: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('2FA is not enabled');
    }

    // Validate code format for Google Authenticator
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Code must be exactly 6 digits from Google Authenticator');
    }

    // Verify the code with Google Authenticator settings
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      digits: 6,
      algorithm: 'sha1',
      window: 1, // 30 seconds tolerance
    });

    if (!verified) {
      throw new Error('Invalid Google Authenticator code');
    }

    return { verified: true };
  }

  static async disable2FA(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new Error('2FA is not enabled');
    }

    // Verify password before disabling 2FA
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return { message: '2FA disabled successfully' };
  }

  static async verifyLoginWith2FA(_tempToken: string, userId: string, code: string) {
    // In production, you should validate the tempToken from a cache/session store
    // For now, we'll just verify the 2FA code
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new Error('2FA is not enabled');
    }

    // Validate Google Authenticator code format
    if (!/^\d{6}$/.test(code)) {
      throw new Error('Please enter the 6-digit code from Google Authenticator');
    }

    // Verify the code with Google Authenticator settings
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      digits: 6,
      algorithm: 'sha1',
      window: 1, // 30 seconds tolerance for time sync issues
    });

    if (!verified) {
      throw new Error('Invalid Google Authenticator code. Check if your device time is synchronized');
    }

    // Update last login
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
      },
    });

    return { 
      verified: true,
      message: 'Successfully authenticated with Google Authenticator'
    };
  }

  private static generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }
}