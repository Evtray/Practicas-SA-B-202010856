import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/change-password', UserController.changePassword);
router.delete('/2fa', UserController.disable2FA);
router.delete('/account', UserController.deleteAccount);

export default router;