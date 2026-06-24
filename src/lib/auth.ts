// src/lib/auth.ts
// JWT 认证工具函数 - 用于生成、验证 JWT Token 以及提取用户信息

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

/** JWT Payload 结构 */
interface JWTPayload {
  userId: string
  phone: string
}

/**
 * JWT 密钥 - 从环境变量读取
 * 未设置时使用开发环境默认值，生产环境必须配置
 */
const JWT_SECRET_VALUE = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE)

/** Cookie 名称 */
const COOKIE_NAME = 'token'

/**
 * 生成 JWT Token
 * @param payload - 用户信息（userId + phone）
 * @returns JWT 字符串，有效期 7 天
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

/**
 * 验证 JWT Token
 * @param token - JWT 字符串
 * @returns 解析后的 payload，验证失败返回 null
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/**
 * 从请求中获取当前登录用户
 * @param request - Next.js Request 对象
 * @returns 用户信息（userId + phone），未登录返回 null
 */
export async function getCurrentUser(request?: Request): Promise<JWTPayload | null> {
  try {
    // 优先从 Authorization header 获取
    if (request) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        return await verifyToken(token)
      }
    }

    // 回退到 Cookie 获取
    const cookieStore = cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    return await verifyToken(token)
  } catch {
    return null
  }
}

/**
 * 设置认证 Cookie
 * @param token - JWT 字符串
 */
export function setAuthCookie(token: string): void {
  // Note: 在 Route Handler 中使用，通过 Response 的 Set-Cookie header 设置
  // 这里返回 cookie 配置供调用方使用
  void token
}

/**
 * 获取 Cookie 配置（用于 Response 设置）
 * @param token - JWT 字符串
 * @returns Set-Cookie header 值
 */
export function getAuthCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}

/**
 * 获取清除认证 Cookie 的 header
 * @returns Set-Cookie header 值（过期）
 */
export function getClearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
