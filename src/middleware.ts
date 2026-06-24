// src/middleware.ts
// Next.js 中间件 - 保护需要登录的页面和 API

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 中间件处理函数
 * 功能：
 * 1. 未登录用户访问 /chat/* 重定向到 /login
 * 2. 未登录用户访问受保护的 API 返回 401
 * 3. 已登录用户访问 /login 重定向到 /
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 获取 Token（从 Cookie 或 Authorization header）
  const token = request.cookies.get('token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '')

  // 不需要保护的路由
  const publicPaths = ['/login', '/api/auth/verify-code', '/api/auth/login']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // 静态资源和内部路由不处理
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // 已登录用户访问登录页，重定向到首页
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 未登录用户访问受保护的页面
  if (!isPublicPath && !pathname.startsWith('/api/') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 未登录用户访问受保护的 API
  if (pathname.startsWith('/api/') && !isPublicPath && !token) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

/**
 * 中间件匹配路径
 */
export const config = {
  matcher: [
    // 保护所有页面，除了静态资源
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
