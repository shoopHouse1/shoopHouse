import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from '../services/auth.service';
import { logAudit } from '../services/audit.service';
import { UserRole } from '@shoophouse/shared';

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400).json({ error: 'Email already exists' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role || UserRole.BUYER,
      roleId: role === UserRole.ADMIN ? 1 : role === UserRole.SELLER ? 2 : 3,
    },
    select: { id: true, name: true, email: true, role: true, roleId: true },
  });

  if (user.role === UserRole.SELLER) {
    await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        status: 'PENDING',
      },
    });
  }

  res.status(201).json({ user });
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, passwordHash: true, role: true, roleId: true } });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  });

  const refreshToken = generateRefreshToken();
  await saveRefreshToken(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      roleId: user.roleId,
    },
    accessToken,
  });
}

export async function refresh(req: AuthRequest, res: Response): Promise<void> {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  const result = await verifyRefreshToken(refreshToken);
  if (!result) {
    res.status(401).json({ error: 'Invalid refresh token' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { id: true, email: true, role: true, roleId: true },
  });

  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  });

  res.json({ accessToken });
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
}

export async function forgotPassword(req: AuthRequest, res: Response): Promise<void> {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists
    res.json({ message: 'If email exists, reset link sent' });
    return;
  }

  // TODO: Send email with reset token
  // For now, just return success
  res.json({ message: 'If email exists, reset link sent' });
}

export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  const { token, password } = req.body;

  // TODO: Verify reset token from email
  // For now, stub implementation
  res.json({ message: 'Password reset (stub)' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      roleId: true,
      createdAt: true,
      sellerProfile: {
        select: {
          id: true,
          displayName: true,
          status: true,
          bio: true,
        },
      },
    },
  });

  res.json({ user });
}


