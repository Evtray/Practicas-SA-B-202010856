import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { EncryptionService } from '../utils/encryption';

const prisma = new PrismaClient();

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        encryptedName: true,
        isEmailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Decrypt sensitive data
    const name = EncryptionService.decrypt(user.encryptedName);

    return {
      id: user.id,
      email: user.email,
      name,
      isEmailVerified: user.isEmailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  static async updateProfile(userId: string, data: { name?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updateData: any = {};

    if (data.name) {
      updateData.encryptedName = EncryptionService.encrypt(data.name);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        encryptedName: true,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: data.name || EncryptionService.decrypt(updatedUser.encryptedName),
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  static async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Delete user and all related data (cascade delete will handle refresh tokens)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}