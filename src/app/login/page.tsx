// src/app/login/page.tsx
// 登录页面 - 手机号 + 验证码登录（紫色主题）

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * 登录页面组件
 * 功能：
 * 1. 输入手机号
 * 2. 发送验证码（开发环境固定 123456）
 * 3. 输入验证码并登录
 * 4. 登录成功后跳转到首页
 */
export default function LoginPage() {
  const router = useRouter()
  const { login, sendVerifyCode, isAuthenticated, isLoading } = useAuthStore()

  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [codeMessage, setCodeMessage] = useState('')

  // 已登录则跳转首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }

    setError('')
    setCodeMessage('')

    try {
      const message = await sendVerifyCode(phone)
      setCodeSent(true)
      setCountdown(60)
      setCodeMessage(message)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败')
    }
  }

  /**
   * 登录
   */
  const handleLogin = async () => {
    if (!phone || !code) {
      setError('请输入手机号和验证码')
      return
    }

    setError('')

    try {
      await login(phone, code)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    }
  }

  /**
   * 回车键登录
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && codeSent && code) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo 区域 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💜</div>
          <h1 className="text-2xl font-bold text-gray-800">纸片人男友</h1>
          <p className="text-gray-500 mt-2">你的专属虚拟恋人</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* 手机号输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              手机号
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800"
            />
          </div>

          {/* 验证码输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              验证码
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入验证码"
                maxLength={6}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800"
              />
              <button
                onClick={handleSendCode}
                disabled={countdown > 0 || !phone}
                className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          {/* 验证码提示信息 */}
          {codeMessage && (
            <p className="text-sm text-green-600 mb-3">{codeMessage}</p>
          )}

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-red-500 mb-3">{error}</p>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={isLoading || !codeSent || !code}
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-400 text-white rounded-xl font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-violet-500 transition-all"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>

          {/* 开发环境提示 */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              开发环境：验证码固定为 123456
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
