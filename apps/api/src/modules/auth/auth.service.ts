import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { APP_CONSTANTS } from '@repo/config';
import type { AuthResponse, IAuthTokens, ITokenPayload, IUser, RegisterRequest, LoginRequest } from '@repo/types';

import { env } from '../../core/config/env.js';
import { AppError } from '../../core/errors/AppError.js';
import type { AuthRepository } from './auth.repository.js';
import type { IUserDocument } from './auth.schema.js';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(dto: RegisterRequest): Promise<AuthResponse> {
    const exists = await this.authRepository.existsByEmail(dto.email);
    if (exists) {
      throw AppError.conflict('Email already in use', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
    const user = await this.authRepository.create({ ...dto, password: hashedPassword });

    const tokens = this.generateTokens(user);
    await this.authRepository.updateRefreshToken(user.id as string, tokens.refreshToken);

    return { user: this.toUserResponse(user), tokens };
  }

  async login(dto: LoginRequest): Promise<AuthResponse> {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user);
    await this.authRepository.updateRefreshToken(user.id as string, tokens.refreshToken);

    return { user: this.toUserResponse(user), tokens };
  }

  async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    let payload: ITokenPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    const user = await this.authRepository.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token revoked', 401, 'INVALID_TOKEN');
    }

    const tokens = this.generateTokens(user);
    await this.authRepository.updateRefreshToken(user.id as string, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.updateRefreshToken(userId, null);
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found', 'USER_NOT_FOUND');
    }
    return this.toUserResponse(user);
  }

  private generateTokens(user: IUserDocument): IAuthTokens {
    const payload: ITokenPayload = {
      userId: user.id as string,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: APP_CONSTANTS.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: APP_CONSTANTS.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private toUserResponse(user: IUserDocument): IUser {
    return {
      id: user.id as string,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
