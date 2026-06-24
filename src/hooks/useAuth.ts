// src/hooks/useAuth.ts
// 认证状态 Hook - 封装登录、退出、状态恢复等逻辑

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * 认证 Hook
 * 功能：
 * 1. 页面加载时从 localStorage 恢复 Token 并获取用户信息
 * 2. 提供登录、退出、发送验证码等方法
 * 3. 提供认证状态和加载状态
 */
export function useAuth() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    fetchUser,
    setToken,
    sendVerifyCode
  } = useAuthStore()

  /**
   * 页面加载时恢复登录状态
   * 从 localStorage 读取 Token，然后调用 /api/auth/me 验证
   */
  useEffect(() => {
    if (!isAuthenticated && !token) {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
    }
  }, [isAuthenticated, token, setToken])

  /**
   * Token 变化时获取用户信息
   */
  useEffect(() => {
    if (token && !user) {
      fetchUser()
    }
  }, [token, user, fetchUser])

  /**
   * 退出登录并跳转到登录页
   */
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    sendVerifyCode
  }
}
