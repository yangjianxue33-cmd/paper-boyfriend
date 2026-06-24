// src/app/api/sessions/route.ts
// 聊天会话 CRUD API - 获取会话列表、创建新会话

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/sessions
 * 获取当前用户的所有聊天会话
 * @returns { success: boolean, sessions: ChatSession[] }
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      )
    }

    const sessions = await prisma.chatSession.findMany({
      where: {
        userId: user.userId,
        isActive: true
      },
      include: {
        character: true
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      sessions
    })
  } catch (error) {
    console.error('获取会话列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取会话列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/sessions
 * 创建新的聊天会话
 * @param characterId - 角色 ID
 * @returns { success: boolean, session: ChatSession }
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '请先登录' },
        { status: 401 }
      )
    }

    const { characterId } = await request.json()

    if (!characterId) {
      return NextResponse.json(
        { success: false, message: '请选择角色' },
        { status: 400 }
      )
    }

    // 检查角色是否存在
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    })

    if (!character) {
      return NextResponse.json(
        { success: false, message: '角色不存在' },
        { status: 404 }
      )
    }

    // 检查是否已有该角色的会话
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId: user.userId,
        characterId,
        isActive: true
      }
    })

    if (existingSession) {
      // 返回已有会话
      return NextResponse.json({
        success: true,
        session: existingSession
      })
    }

    // 创建新会话
    const session = await prisma.chatSession.create({
      data: {
        userId: user.userId,
        characterId,
        title: `与 ${character.name} 的聊天`
      },
      include: {
        character: true
      }
    })

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('创建会话失败:', error)
    return NextResponse.json(
      { success: false, message: '创建会话失败' },
      { status: 500 }
    )
  }
}
