// src/stores/authStore.ts
// 认证状态管理 - 管理用户登录状态、Token 和用户信息

import { create } from 'zustand'

/** 用户信息 */
interface User {
  id: string
  phone: string
  nickname?: string
  avatar?: string
  profile?: {
    personality?: string
    ageRange?: string
    hobbies?: string[]
    emotionalPattern?: string
    workExperience?: string
  } | null
}

/** 认证状态 */
interface AuthState {
  /** 当前用户 */
  user: User | null
  /** 是否已登录 */
  isAuthenticated: boolean
  /** 加载状态 */
  isLoading: boolean
  /** JWT Token */
  token: string | null

  /** 登录（手机号 + 验证码） */
  login: (phone: string, code: string) => Promise<void>
  /** 退出登录 */
  logout: () => void
  /** 获取当前用户信息 */
  fetchUser: () => Promise<void>
  /** 设置 Token（用于从 localStorage 恢复） */
  setToken: (token: string) => void
  /** 发送验证码 */
  sendVerifyCode: (phone: string) => Promise<string>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,

  /**
   * 发送短信验证码
   * @param phone - 手机号
   * @returns 服务端返回的消息
   */
  sendVerifyCode: async (phone: string) => {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    })

    const data = await res.json()

    if (!data.success) {
      throw new Error(data.message || '发送验证码失败')
    }

    return data.message
  },

  /**
   * 手机号 + 验证码登录
   * @param phone - 手机号
   * @param code - 验证码
   */
  login: async (phone: string, code: string) => {
    set({ isLoading: true })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.message || '登录失败')
      }

      // 存储 Token 到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token)
      }

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  /**
   * 退出登录 - 清除本地状态和 Token
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false
    })
  },

  /**
   * 获取当前用户信息（从 /api/auth/me）
   * 用于页面加载时恢复登录状态
   */
  fetchUser: async () => {
    const { token } = get()
    if (!token) return

    set({ isLoading: true })

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.success) {
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        // Token 无效，清除状态
        get().logout()
      }
    } catch {
      get().logout()
    }
  },

  /**
   * 设置 Token（用于从 localStorage 恢复登录态）
   * @param token - JWT Token
   */
  setToken: (token: string) => {
    set({ token })
  }
}))
