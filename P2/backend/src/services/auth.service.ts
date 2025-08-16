import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { JWTService } from '../utils/jwt';
import { EncryptionService } from '../utils/encryption';
import { EmailService } from './email.service';
import { config } from '../config/env';

const prisma = new PrismaClient();

export class AuthService {
  static async register(email: string, name: string, password: string) {
    // Check if user already exists
    const encryptedEmail = EncryptionService.encrypt(email);
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { encryptedEmail }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Encrypt sensitive data
    const encryptedName = EncryptionService.encrypt(name);
    
    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        encryptedEmail,
        encryptedName,
        password: hashedPassword,
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    // Send verification email
    await EmailService.sendVerificationEmail(email, emailVerifyToken);

    return {
      userId: user.id,
      message: 'User registered successfully. Please verify your email.',
    };
  }

  static async verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
      throw new Error('Verification token has expired');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  static async login(email: string, password: string) {
    console.log('🔍 Looking for user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ User not found with email:', email);
      throw new Error('Invalid credentials');
    }
    console.log('✅ User found:', { id: user.id, email: user.email });

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      console.log('🔒 Account is locked until:', user.lockedUntil);
      throw new Error(`Account is locked. Try again in ${remainingTime} minutes`);
    }

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const maxAttempts = config.rateLimit.maxLoginAttempts;
      
      if (attempts >= maxAttempts) {
        // Lock account
        const lockoutTime = config.rateLimit.lockoutTime * 60 * 1000; // Convert to milliseconds
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: attempts,
            lockedUntil: new Date(Date.now() + lockoutTime),
          },
        });
        console.log('🔒 Account locked due to too many attempts');
        throw new Error(`Account locked due to too many failed attempts. Try again in ${config.rateLimit.lockoutTime} minutes`);
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: attempts },
        });
        console.log(`⚠️ Login attempt ${attempts}/${maxAttempts}`);
        throw new Error('Invalid credentials');
      }
    }
    console.log('✅ Password is valid');

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('❌ Email not verified for user:', email);
      throw new Error('Please verify your email before logging in');
    }
    console.log('✅ Email is verified');

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Decrypt user data
    const decryptedName = EncryptionService.decrypt(user.encryptedName);

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      console.log('🔐 2FA is enabled for user, generating temp token...');
      // Generate temporary token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      
      console.log('📝 Returning 2FA challenge with tempToken');
      // Store temp token in memory or cache (for simplicity, we'll return it)
      return {
        requiresTwoFactor: true,
        tempToken,
        userId: user.id,
      };
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      has2FA: user.twoFactorEnabled,
    };

    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = JWTService.generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: decryptedName,
        has2FA: user.twoFactorEnabled,
      },
      accessToken,
      refreshToken,
      requiresTwoFactor: false,
    };
  }

  static async refreshToken(refreshToken: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token has expired');
    }

    // Generate new access token
    const payload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      isEmailVerified: storedToken.user.isEmailVerified,
      has2FA: storedToken.user.twoFactorEnabled,
    };

    const accessToken = JWTService.generateAccessToken(payload);

    return { accessToken };
  }

  static async logout(userId: string) {
    // Remove all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out successfully' };
  }

  static async resendVerificationEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpiry,
      },
    });

    // Send verification email
    await EmailService.sendVerificationEmail(email, emailVerifyToken);

    return { message: 'Verification email sent successfully' };
  }
}