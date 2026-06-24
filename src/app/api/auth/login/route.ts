// src/app/api/auth/login/route.ts
// 手机号 + 验证码登录 - 验证通过后创建/获取用户并返回 JWT Token

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, getAuthCookieHeader } from '@/lib/auth'
import { getStoredCode, deleteStoredCode } from '@/app/api/auth/verify-code/route'

/**
 * POST /api/auth/login
 * 手机号 + 验证码登录
 * @param phone - 手机号
 * @param code - 验证码
 * @returns { success: boolean, token: string, user: object }
 */
export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json()

    // 校验参数
    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: '手机号和验证码不能为空' },
        { status: 400 }
      )
    }

    // 验证验证码
    const storedCode = getStoredCode(phone)
    if (!storedCode) {
      return NextResponse.json(
        { success: false, message: '请先获取验证码' },
        { status: 400 }
      )
    }

    if (storedCode.expiresAt < Date.now()) {
      deleteStoredCode(phone)
      return NextResponse.json(
        { success: false, message: '验证码已过期，请重新获取' },
        { status: 400 }
      )
    }

    if (storedCode.code !== code) {
      return NextResponse.json(
        { success: false, message: '验证码错误' },
        { status: 400 }
      )
    }

    // 验证码正确，删除已使用的验证码
    deleteStoredCode(phone)

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      // 新用户，自动创建
      user = await prisma.user.create({
        data: {
          phone,
          nickname: `用户${phone.slice(-4)}`,
          authType: 'phone'
        }
      })
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // 生成 JWT Token
    const token = await signToken({
      userId: user.id,
      phone: user.phone
    })

    // 返回响应，设置 Cookie
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar
      }
    })

    response.headers.set('Set-Cookie', getAuthCookieHeader(token))

    return response
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
