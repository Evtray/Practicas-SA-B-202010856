import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { GoogleAuthController } from '../controllers/googleAuth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/login', loginRateLimiter, AuthController.login);
router.post('/verify-2fa', AuthController.verify2FA);
router.post('/refresh', AuthController.refreshToken);
router.post('/resend-verification', AuthController.resendVerificationEmail);

// Protected routes
router.post('/setup-2fa', authMiddleware, AuthController.setup2FA);
router.post('/confirm-2fa', authMiddleware, AuthController.confirm2FA);
router.post('/logout', authMiddleware, AuthController.logout);

// Google OAuth routes
router.get('/google/url', GoogleAuthController.getGoogleAuthUrl);
router.post('/google/link', authMiddleware, GoogleAuthController.linkGoogleAccount);

export default router;