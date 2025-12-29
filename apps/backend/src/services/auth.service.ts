import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { UserRole } from '@shoophouse/shared';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: { userId: string; email: string; role: UserRole }): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const tokenHash = await hashPassword(token);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const tokens = await prisma.refreshToken.findMany({
    where: {
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  for (const refreshToken of tokens) {
    const isValid = await comparePassword(token, refreshToken.tokenHash);
    if (isValid) {
      return { userId: refreshToken.userId };
    }
  }

  return null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokens = await prisma.refreshToken.findMany({
    where: { revoked: false },
  });

  for (const refreshToken of tokens) {
    const isValid = await comparePassword(token, refreshToken.tokenHash);
    if (isValid) {
      await prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: { revoked: true },
      });
      return;
    }
  }
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}


