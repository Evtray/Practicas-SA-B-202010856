import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { TwoFactorService } from '../services/twoFactor.service';

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await UserService.getProfile(userId);
      return res.json({ user });
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { name } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await UserService.updateProfile(userId, { name });
      return res.json({
        message: 'Perfil actualizado exitosamente',
        user,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
      }

      const result = await UserService.changePassword(userId, currentPassword, newPassword);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async disable2FA(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { password } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const result = await TwoFactorService.disable2FA(userId, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async deleteAccount(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.userId;
      const { password } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const result = await UserService.deleteAccount(userId, password);
      
      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}