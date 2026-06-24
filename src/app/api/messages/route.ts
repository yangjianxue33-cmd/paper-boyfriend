// src/app/api/messages/route.ts
// 消息 CRUD API - 获取消息列表、保存新消息

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/messages?sessionId=xxx&page=0&limit=20
 * 获取指定会话的消息列表（分页）
 * @param sessionId - 会话 ID
 * @param page - 页码（默认 0）
 * @param limit - 每页数量（默认 20）
 * @returns { success: boolean, messages: Message[], total: number }
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

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: '缺少 sessionId 参数' },
        { status: 400 }
      )
    }

    // 验证会话属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, message: '会话不存在' },
        { status: 404 }
      )
    }

    // 获取消息总数
    const total = await prisma.message.count({
      where: { sessionId }
    })

    // 分页获取消息（按时间正序）
    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: page * limit
    })

    return NextResponse.json({
      success: true,
      messages,
      total
    })
  } catch (error) {
    console.error('获取消息列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取消息列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messages
 * 保存新消息
 * @param sessionId - 会话 ID
 * @param role - 发送者（user/assistant）
 * @param content - 消息内容
 * @param contentType - 消息类型（text/image/choice/system）
 * @param audioUrl - 语音 URL（可选）
 * @param imageUrl - 图片 URL（可选）
 * @param metadata - 扩展信息（可选）
 * @returns { success: boolean, message: Message }
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

    const { sessionId, role, content, contentType = 'text', audioUrl, imageUrl, metadata } = await request.json()

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证会话属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.userId
      }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, message: '会话不存在' },
        { status: 404 }
      )
    }

    // 保存消息
    const message = await prisma.message.create({
      data: {
        sessionId,
        role,
        content,
        contentType,
        audioUrl: audioUrl || null,
        imageUrl: imageUrl || null,
        metadata: metadata || {}
      }
    })

    // 更新会话的最后消息时间和消息数量
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: new Date(),
        messageCount: { increment: 1 }
      }
    })

    return NextResponse.json({
      success: true,
      message
    })
  } catch (error) {
    console.error('保存消息失败:', error)
    return NextResponse.json(
      { success: false, message: '保存消息失败' },
      { status: 500 }
    )
  }
}
