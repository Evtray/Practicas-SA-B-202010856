import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { TwoFactorService } from '../services/twoFactor.service';
import { JWTService } from '../utils/jwt';

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, name, password } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Email, name and password are required' });
      }

      // Password validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      const result = await AuthService.register(email, name, password);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const result = await AuthService.verifyEmail(token);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);

      if (result.requiresTwoFactor) {
        // Return temp token for 2FA verification
        return res.json({
          message: 'Se requiere código 2FA',
          requiresTwoFactor: true,
          tempToken: result.tempToken,
          userId: result.userId,
        });
      }

      // Set cookies
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        message: 'Login exitoso',
        user: result.user,
        requiresTwoFactor: false,
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async verify2FA(req: Request, res: Response): Promise<Response> {
    try {
      const { tempToken, userId, code } = req.body;

      if (!tempToken || !userId || !code) {
        return res.status(400).json({ error: 'Temp token, user ID and code are required' });
      }

      // Verify 2FA code
      await TwoFactorService.verifyLoginWith2FA(tempToken, userId, code);

      // Generate tokens after successful 2FA
      const payload = {
        userId,
        email: '', // You should fetch this from database
        isEmailVerified: true,
        has2FA: true,
      };

      const accessToken = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Autenticación 2FA exitosa',
        user: { id: userId },
      });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async setup2FA(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await TwoFactorService.setup2FA(userId);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async confirm2FA(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { code } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!code) {
        return res.status(400).json({ error: '2FA code is required' });
      }

      const result = await TwoFactorService.verify2FASetup(userId, code);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      return res.json({ message: 'Token renovado exitosamente' });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (userId) {
        await AuthService.logout(userId);
      }

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return res.json({ message: 'Logout exitoso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async resendVerificationEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await AuthService.resendVerificationEmail(email);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}