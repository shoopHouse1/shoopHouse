import { prisma } from '../lib/prisma';

export async function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId?: string,
  meta?: Record<string, unknown>
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      meta: meta as any,
    },
  });
}


