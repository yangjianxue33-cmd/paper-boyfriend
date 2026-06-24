// src/lib/prisma.ts
// Prisma Client 单例 - 避免开发环境热重载时创建多个连接

import { PrismaClient } from '@prisma/client'

/**
 * 全局 Prisma Client 实例
 * 开发环境下复用同一个连接，避免热重载时连接数暴涨
 * 生产环境直接创建新实例
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
