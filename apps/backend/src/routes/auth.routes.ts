import { Router } from 'express';
import { register, login, refresh, logout, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '@shoophouse/shared';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later',
});

router.post('/register', validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/forgot', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset', validate(resetPasswordSchema), resetPassword);
router.get('/me', authenticate, getMe);

export default router;


