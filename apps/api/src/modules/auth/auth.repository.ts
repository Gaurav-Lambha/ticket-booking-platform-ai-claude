import type { IUserDocument } from './auth.schema.js';
import { UserModel } from './auth.schema.js';

export class AuthRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return UserModel.findOne({ email }).select('+password +refreshToken');
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return UserModel.findById(id);
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<IUserDocument> {
    return UserModel.create(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  }
}
