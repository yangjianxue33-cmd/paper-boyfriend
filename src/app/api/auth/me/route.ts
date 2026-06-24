// src/app/api/auth/me/route.ts
// 获取当前登录用户信息 - 根据 JWT Token 识别用户

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 * @returns { success: boolean, user: object }
 */
export async function GET(request: Request) {
  try {
    // 从 Token 中获取用户信息
    const currentUser = await getCurrentUser(request)

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    // 从数据库查询用户完整信息
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      include: {
        profile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        profile: user.profile
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户信息失败' },
      { status: 500 }
    )
  }
}
