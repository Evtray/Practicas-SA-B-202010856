import { Request, Response } from 'express';
import { JWTService } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GoogleAuthController {
  // This is called after successful Google authentication
  static async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      // Generate JWT tokens
      const payload = {
        userId: user.id,
        email: user.email,
        isEmailVerified: true, // Google users are always verified
        has2FA: user.twoFactorEnabled,
      };

      const accessToken = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend success page
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?login=success`);
    } catch (error: any) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  // Get Google login URL (for frontend)
  static getGoogleAuthUrl(_req: Request, res: Response): Response {
    const googleAuthUrl = `/auth/google`;
    return res.json({ 
      url: googleAuthUrl,
      fullUrl: `http://localhost:3000${googleAuthUrl}`
    });
  }

  // Link existing account with Google
  static async linkGoogleAccount(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const googleUser = req.user as any;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!googleUser) {
        return res.status(400).json({ error: 'No Google account to link' });
      }

      // Update user with Google email if different
      await prisma.user.update({
        where: { id: userId },
        data: {
          isEmailVerified: true,
          // You might want to add a googleId field to track linked accounts
        },
      });

      return res.json({ 
        message: 'Google account linked successfully',
        email: googleUser.email 
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}