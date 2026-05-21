import type { Request, Response } from 'express';

import { asyncWrapper } from '../../core/utils/asyncWrapper.js';
import { sendCreated, sendSuccess } from '../../core/utils/apiResponse.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncWrapper(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  });

  login = asyncWrapper(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    sendSuccess(res, result, 200, 'Login successful');
  });

  refreshTokens = asyncWrapper(async (req: Request, res: Response) => {
    const tokens = await this.authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, tokens);
  });

  logout = asyncWrapper(async (req: Request, res: Response) => {
    await this.authService.logout(req.user!.userId);
    sendSuccess(res, null, 200, 'Logged out successfully');
  });

  getProfile = asyncWrapper(async (req: Request, res: Response) => {
    const user = await this.authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  });
}
