import { Router } from 'express';

import { authenticate } from '../../shared/middleware/auth.middleware.js';
import { authRateLimiter } from '../../shared/middleware/rateLimiter.middleware.js';
import { validate } from '../../shared/middleware/validate.middleware.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.validation.js';

const router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshTokens);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);

export default router;
