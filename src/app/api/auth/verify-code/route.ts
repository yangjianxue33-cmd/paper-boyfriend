// src/app/api/auth/verify-code/route.ts
// 发送短信验证码 - 开发阶段使用固定验证码 123456

import { NextResponse } from 'next/server'

// 开发环境固定验证码
const DEV_VERIFY_CODE = '123456'

// 临时存储验证码（生产环境应使用 Redis）
const codeStore = new Map<string, { code: string; expiresAt: number }>()

/**
 * POST /api/auth/verify-code
 * 发送短信验证码
 * @param phone - 手机号
 * @returns { success: boolean, message: string }
 */
export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    // 校验手机号格式
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '请输入正确的手机号' },
        { status: 400 }
      )
    }

    // 开发环境使用固定验证码
    const code = process.env.NODE_ENV === 'production' 
      ? generateRandomCode() 
      : DEV_VERIFY_CODE

    // 存储验证码，5分钟有效
    codeStore.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    // 生产环境应调用短信 API 发送验证码
    if (process.env.NODE_ENV === 'production') {
      // TODO: 调用阿里云/腾讯云短信 API
      console.log(`发送验证码 ${code} 到 ${phone}`)
    }

    return NextResponse.json({
      success: true,
      message: process.env.NODE_ENV === 'production' 
        ? '验证码已发送' 
        : `验证码已发送（开发环境固定为 ${DEV_VERIFY_CODE}）`
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, message: '发送验证码失败' },
      { status: 500 }
    )
  }
}

/**
 * 生成6位随机验证码
 * @returns 6位数字字符串
 */
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 获取存储的验证码（供登录接口使用）
 * @param phone - 手机号
 * @returns 验证码信息，不存在返回 null
 */
export function getStoredCode(phone: string): { code: string; expiresAt: number } | null {
  return codeStore.get(phone) || null
}

/**
 * 删除已使用的验证码
 * @param phone - 手机号
 */
export function deleteStoredCode(phone: string): void {
  codeStore.delete(phone)
}
