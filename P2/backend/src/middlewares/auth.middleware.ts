import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    if (JWTService.isTokenExpired(token)) {
      if (JWTService.isInGracePeriod(token)) {
        const decoded = JWTService.decodeToken(token);
        if (decoded) {
          const newToken = JWTService.generateAccessToken(decoded);
          res.cookie('access_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
          });
          (req as any).user = decoded;
          return next();
        }
      }
      return res.status(401).json({ error: 'Token expired' });
    }

    const decoded = JWTService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};