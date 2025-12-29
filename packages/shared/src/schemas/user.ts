import { z } from 'zod';
import { UserRole } from '../types';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
});


