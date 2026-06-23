# 纸片人男友 - 技术架构文档

> 版本：v2.0
> 日期：2026-06-23
> 状态：开发中

---

## 一、技术栈概览

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **框架** | Next.js 14 (App Router) | React 生态，SSR/SSG 支持 |
| **语言** | TypeScript | 类型安全 |
| **样式** | Tailwind CSS | 快速开发，聊天气泡等样式用 `@apply` 封装 |
| **状态管理** | Zustand | 轻量级，比 Redux 简单 |
| **数据库** | PostgreSQL 14+ | 关系型数据库 |
| **ORM** | Prisma | 与 Next.js 生态集成好 |
| **认证** | JWT + 短信验证码 | 手机号登录，可选微信授权 |
| **LLM 对话** | 扣子 Coze API | 通过 Next.js API Route 代理调用 |
| **TTS 语音** | 火山引擎语音合成 API | 通过 Next.js API Route 代理调用 |
| **图像生成** | 火山引擎即梦/Seedream API | 通过 Next.js API Route 代理调用 |

---

## 二、项目结构

```
d:\纸片人男友\
├── prisma/
│   ├── schema.prisma           # Prisma 数据模型定义
│   └── migrations/             # 数据库迁移文件
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页（角色选择）
│   │   ├── globals.css          # 全局样式
│   │   ├── login/
│   │   │   └── page.tsx        # 登录页面
│   │   ├── chat/
│   │   │   └── [characterId]/   # 聊天页面路由
│   │   │       └── page.tsx
│   │   └── api/                 # API 路由
│   │       ├── auth/
│   │       │   ├── login/route.ts      # 手机号登录
│   │       │   ├── verify-code/route.ts # 发送验证码
│   │       │   └── me/route.ts         # 获取当前用户
│   │       ├── chat/
│   │       │   └── route.ts     # 扣子对话代理
│   │       ├── tts/
│   │       │   └── route.ts     # 火山 TTS 代理
│   │       ├── image/
│   │       │   └── route.ts     # 火山图像生成代理
│   │       ├── sessions/
│   │       │   └── route.ts     # 聊天会话 CRUD
│   │       └── messages/
│   │           └── route.ts     # 消息 CRUD
│   │
│   ├── components/              # 公共组件
│   │   ├── CharacterCard.tsx    # 角色卡片
│   │   ├── ChatBubble.tsx       # 聊天气泡
│   │   ├── AudioPlayer.tsx      # 语音播放组件
│   │   ├── ImageMessage.tsx     # 图片消息组件
│   │   ├── TypingIndicator.tsx  # 正在输入指示器
│   │   ├── ChoiceQuestion.tsx   # 选择题组件
│   │   ├── ShareModal.tsx       # 分享弹窗
│   │   ├── InviteButton.tsx    # 邀请按钮
│   │   └── LoginForm.tsx       # 登录表单
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useAuth.ts          # 认证状态 Hook
│   │   ├── useChat.ts          # 聊天逻辑 Hook
│   │   ├── useAudio.ts         # 语音播放 Hook
│   │   └── useImageGen.ts      # 图片生成 Hook
│   │
│   ├── stores/                  # Zustand 状态管理
│   │   ├── authStore.ts        # 认证状态
│   │   ├── chatStore.ts        # 聊天状态
│   │   ├── userStore.ts        # 用户画像状态
│   │   └── characterStore.ts   # 角色状态
│   │
│   ├── services/                # 前端 API 调用层
│   │   ├── auth.ts             # 认证相关 API
│   │   ├── chat.ts             # 调用 /api/chat
│   │   ├── tts.ts              # 调用 /api/tts
│   │   ├── image.ts            # 调用 /api/image
│   │   ├── sessions.ts         # 会话管理 API
│   │   └── messages.ts         # 消息管理 API
│   │
│   ├── lib/                     # 工具函数
│   │   ├── prisma.ts           # Prisma Client 单例
│   │   ├── constants.ts        # 常量（角色配置等）
│   │   ├── types.ts            # TypeScript 类型定义
│   │   └── utils.ts            # 通用工具函数
│   │
│   └── prompts/                 # AI 提示词
│       ├── systemPrompt.ts     # 系统角色设定
│       ├── imagePrompt.ts      # 生图提示词模板
│       └── questionBank.ts     # 选择题题库
│
├── public/                      # 静态资源
│   ├── characters/             # 角色头像
│   └── images/                 # 其他图片资源
│
├── .env.local                  # 环境变量
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
├── ARCHITECTURE.md
└── DATABASE.md
```

---

## 三、核心数据模型

### 3.1 数据库实体关系

```
users (用户)
  ├── user_profiles (用户画像) 1:1
  ├── chat_sessions (聊天会话) 1:N
  │     └── messages (消息) 1:N
  ├── invitations_sent (发出的邀请) 1:N
  ├── invitations_received (收到的邀请) 1:N
  └── user_favorites (收藏) 1:N

characters (角色)
  └── chat_sessions (聊天会话) 1:N
```

### 3.2 TypeScript 类型定义

```typescript
// 用户
interface User {
  id: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  authType: 'phone' | 'wechat';
  wechatOpenid?: string;
  status: 'active' | 'blocked';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 用户画像
interface UserProfile {
  id: string;
  userId: string;
  personality?: string;
  ageRange?: '20-25' | '26-30' | '30+';
  hobbies: string[];
  emotionalPattern?: string;
  workExperience?: string;
  preferences: Record<string, unknown>;
}

// 角色
interface Character {
  id: string;
  name: string;
  type: string;
  avatar?: string;
  occupation?: string;
  personality: string[];
  backstory?: string;
  mbti?: string;
  weaknesses?: string;
  systemPrompt: string;
  voiceId?: string;
  sortOrder: number;
  isActive: boolean;
}

// 聊天会话
interface ChatSession {
  id: string;
  userId: string;
  characterId: string;
  title?: string;
  lastMessageAt?: Date;
  messageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 消息
interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: 'text' | 'image' | 'choice' | 'system';
  audioUrl?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// 邀请关系
interface Invitation {
  id: string;
  inviterId: string;
  inviteeId?: string;
  inviteCode: string;
  status: 'pending' | 'registered' | 'completed';
  invitedAt: Date;
  registeredAt?: Date;
}

// 用户收藏
interface UserFavorite {
  id: string;
  userId: string;
  sessionId: string;
  messageIds: string[];
  title?: string;
  createdAt: Date;
}
```

---

## 四、认证方案设计

### 4.1 认证流程

```
[用户输入手机号] → [发送验证码] → [输入验证码] → [JWT Token] → [登录成功]
                                                          ↓
                                              [Token 存储在 localStorage]
                                                          ↓
                                              [每次请求携带 Authorization 头]
```

### 4.2 API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/verify-code` | POST | 发送短信验证码 |
| `/api/auth/login` | POST | 手机号 + 验证码登录 |
| `/api/auth/me` | GET | 获取当前登录用户信息 |
| `/api/auth/logout` | POST | 退出登录 |

### 4.3 JWT 设计

```typescript
// JWT Payload
interface JWTPayload {
  userId: string;      // 用户ID
  phone: string;       // 手机号
  iat: number;         // 签发时间
  exp: number;         // 过期时间（7天）
}
```

### 4.4 中间件保护

```typescript
// middleware.ts
// 保护需要登录的页面和 API
// - 未登录用户访问 /chat/* 重定向到 /login
// - 已登录用户访问 /login 重定向到 /
```

---

## 五、AI 能力集成方案

### 5.1 扣子 Coze (LLM 对话)

**API 端点**：`https://api.coze.cn/v1/chat`

**调用流程**：
```
用户发送消息
    ↓
从数据库加载用户画像
    ↓
构建消息列表（包含历史上下文）
    ↓
调用扣子 Chat API（通过 /api/chat 代理）
    ↓
解析返回内容（文字/触发指令）
    ↓
保存消息到数据库
    ↓
触发 TTS 生成语音
    ↓
更新消息 audioUrl
```

**核心提示词结构**：
```
角色设定（systemPrompt）
    +
用户画像（userProfile）
    +
对话历史（最近10-20轮）
    +
当前消息
    ↓
LLM 返回结构化响应
```

### 5.2 火山引擎 TTS (语音合成)

**API 端点**：`https://openspeech.bytedance.com/api/v1/tts`

**调用流程**：
```
收到 LLM 文字回复
    ↓
保存文字消息到数据库
    ↓
异步调用 TTS API（指定角色音色）
    ↓
获取音频 URL
    ↓
更新消息 audioUrl
    ↓
前端渲染播放按钮
```

**音色配置**（每个角色一种音色）：
| 角色 | 推荐音色特点 |
|------|--------------|
| 霸道总裁 | 低沉、稳重 |
| 阳光少年 | 清亮、活泼 |
| 温柔医生 | 柔和、治愈 |
| 神秘艺术家 | 慵懒、磁性 |
| 青梅竹马 | 自然、温暖 |

### 5.3 火山引擎图像生成

**API 端点**：`https://ark.cn-beijing.volces.com/api/v3/image/generations`

**触发条件**：
1. 关键词匹配（加班、周末、美食等）
2. AI 智能判断（情绪高点、超时无图）
3. LLM 返回触发指令

**提示词优化流程**：
```
LLM 返回触发指令 + 场景描述
    ↓
调用提示词优化函数
    ↓
生成专业生图提示词
    ↓
调用图像生成 API（通过 /api/image 代理）
    ↓
获取图片 URL
    ↓
保存图片消息到数据库
    ↓
发送图片消息
```

---

## 六、页面路由设计

```
/                           # 首页 - 角色选择（需登录）
├── /login                 # 登录页面（未登录可访问）
└── /chat/[characterId]    # 聊天页面 - 动态路由（需登录）
```

### 6.1 登录页 (/login)

**功能**：手机号 + 验证码登录

**组件结构**：
```
Page
├── LogoSection             # 产品 Logo
├── LoginForm
│   ├── PhoneInput         # 手机号输入
│   ├── VerifyCodeInput    # 验证码输入
│   └── SubmitButton       # 登录按钮
└── WechatLoginButton      # 微信登录（可选）
```

### 6.2 首页 (/)

**功能**：角色选择入口

**组件结构**：
```
Page
├── UserHeader              # 用户头像 + 昵称
├── HeroSection             # 欢迎语
├── CharacterGrid
│   └── CharacterCard × 5  # 5个角色卡片
└── FooterSection          # 底部说明
```

### 6.3 聊天页 (/chat/[characterId])

**功能**：核心聊天互动

**组件结构**：
```
Page
├── ChatHeader              # 顶部：角色信息 + 邀请按钮
├── MessageList             # 消息列表（可滚动）
│   ├── UserBubble          # 用户消息
│   ├── AIBubble            # AI 消息
│   │   ├── TextBubble      # 文字气泡
│   │   ├── AudioBubble     # 语音气泡
│   │   └── ImageBubble     # 图片气泡
│   ├── ChoiceQuestion      # 选择题气泡
│   └── TypingIndicator    # 正在输入...
├── InputArea               # 底部输入区
│   ├── TextInput           # 文字输入框
│   └── SendButton          # 发送按钮
└── ShareModal              # 分享弹窗
```

---

## 七、状态管理设计 (Zustand)

### 7.1 Auth Store

```typescript
interface AuthStore {
  // 状态
  user: User | null;             // 当前用户
  isAuthenticated: boolean;      // 是否已登录
  isLoading: boolean;             // 加载状态

  // 方法
  login: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}
```

### 7.2 Chat Store

```typescript
interface ChatStore {
  // 状态
  messages: Message[];           // 当前会话消息列表
  isLoading: boolean;             // 是否等待回复
  currentSessionId: string | null; // 当前会话ID

  // 方法
  loadMessages: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  clearChat: () => void;
}
```

### 7.3 User Store

```typescript
interface UserStore {
  // 状态
  profile: UserProfile | null;   // 用户画像

  // 方法
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}
```

---

## 八、API 服务层与代理路由设计

### 8.1 设计原则

- **浏览器端不直接调用外部 AI API**，避免暴露 API Key；
- 所有外部请求通过 Next.js API Route（`src/app/api/*`）代理；
- `services/` 只负责组装参数并调用同域 `/api/*`；
- 需要登录的 API 路由校验 JWT Token。

### 8.2 前端服务层（services/*）

```typescript
// src/services/auth.ts
// 认证相关 API
async function sendVerifyCode(phone: string): Promise<void>
async function login(phone: string, code: string): Promise<{ token: string }>
async function getCurrentUser(): Promise<User>
async function logout(): Promise<void>

// src/services/chat.ts
// 调用 /api/chat，由服务端转发扣子 Coze API
async function sendChatMessage(
  sessionId: string,
  content: string
): Promise<ChatResponse>

// src/services/tts.ts
// 调用 /api/tts，由服务端转发火山 TTS API
async function textToSpeech(
  messageId: string,
  text: string,
  voiceId: string
): Promise<string>

// src/services/image.ts
// 调用 /api/image，由服务端转发火山图像生成 API
async function generateImage(
  sessionId: string,
  scene: string,
  characterId: string
): Promise<string>

// src/services/sessions.ts
// 会话管理 API
async function getSessions(): Promise<ChatSession[]>
async function createSession(characterId: string): Promise<ChatSession>
async function getSessionMessages(sessionId: string): Promise<Message[]>

// src/services/messages.ts
// 消息管理 API
async function saveMessage(message: Partial<Message>): Promise<Message>
async function getMessages(sessionId: string, page: number): Promise<Message[]>
```

### 8.3 Next.js API 路由（app/api/*）

| 路由 | 方法 | 职责 | 认证要求 |
|------|------|------|----------|
| `/api/auth/verify-code` | POST | 发送短信验证码 | 否 |
| `/api/auth/login` | POST | 手机号 + 验证码登录 | 否 |
| `/api/auth/me` | GET | 获取当前用户信息 | 是 |
| `/api/auth/logout` | POST | 退出登录 | 是 |
| `/api/chat` | POST | 转发扣子 Coze API | 是 |
| `/api/tts` | POST | 转发火山 TTS API | 是 |
| `/api/image` | POST | 转发火山图像生成 API | 是 |
| `/api/sessions` | GET/POST | 会话 CRUD | 是 |
| `/api/messages` | GET/POST | 消息 CRUD | 是 |

每个路由负责：
1. 校验 JWT Token（需要认证的接口）；
2. 读取服务端环境变量中的 Key / Token；
3. 校验请求体；
4. 调用上游 API 或操作数据库；
5. 统一错误处理并返回前端可用格式。

---

## 九、数据库访问层（Prisma）

### 9.1 Prisma Client 单例

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 9.2 数据库操作示例

```typescript
// 创建用户
const user = await prisma.user.create({
  data: { phone, nickname: phone }
})

// 获取用户画像
const profile = await prisma.userProfile.findUnique({
  where: { userId },
  include: { user: true }
})

// 创建会话
const session = await prisma.chatSession.create({
  data: {
    userId,
    characterId,
    title: `与 ${characterName} 的聊天`
  }
})

// 保存消息
const message = await prisma.message.create({
  data: {
    sessionId,
    role: 'assistant',
    content,
    contentType: 'text'
  }
})

// 获取会话消息（分页）
const messages = await prisma.message.findMany({
  where: { sessionId },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: page * 20
})
```

---

## 十、环境变量

```env
# .env.local

# 数据库
DATABASE_URL="postgresql://用户名:密码@localhost:5432/paper_boyfriend?schema=public"

# 扣子 API
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_bot_id

# 火山引擎
VOLC_ACCESS_KEY=your_access_key
VOLC_SECRET_KEY=your_secret_key

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 短信服务（阿里云/腾讯云）
SMS_ACCESS_KEY=your_sms_access_key
SMS_SECRET_KEY=your_sms_secret_key
SMS_SIGN_NAME=your_sms_sign_name
SMS_TEMPLATE_CODE=your_template_code

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 十一、技术实现要点

### 11.1 微信风格 UI

- 气泡使用圆角矩形
- 用户气泡在右侧，AI 气泡在左侧
- 气泡颜色区分（用户蓝色系，AI 灰色系）
- 时间戳显示在气泡上方

### 11.2 性能优化

- 消息列表使用虚拟滚动（消息多时）
- 语音预加载（收到文字后立即开始 TTS）
- 图片懒加载
- API 请求防抖（避免用户快速发送）
- 数据库查询优化（索引、分页）

### 11.3 错误处理

- API 调用失败：显示"消息发送失败，点击重试"
- TTS 失败：隐藏语音按钮，只显示文字
- 图像生成失败：AI 用文字描述代替
- 数据库连接失败：显示"服务暂时不可用"

### 11.4 邀请追踪

- 生成邀请码（用户ID的 Base64）
- URL 参数传递邀请码：`/?invite=xxxxx`
- 数据库存储邀请关系
- 被邀请人注册后更新邀请状态

### 11.5 多端同步

- 用户换设备登录时，从数据库加载历史会话
- 消息实时同步（WebSocket 或轮询）
- 用户画像跨设备共享

---

## 十二、开发阶段划分

| 阶段 | 功能 | 优先级 |
|------|------|--------|
| Phase 1 | 项目初始化 + Prisma + 数据库迁移 | P0 |
| Phase 2 | 登录注册页面 + JWT 认证 | P0 |
| Phase 3 | 角色选择页 + 数据库角色配置 | P0 |
| Phase 4 | 聊天界面基础 + 扣子对接 | P0 |
| Phase 5 | 消息持久化（保存到数据库）| P1 |
| Phase 6 | TTS 语音集成 | P1 |
| Phase 7 | 图像生成集成 | P1 |
| Phase 8 | 用户画像收集（选择题）| P1 |
| Phase 9 | 分享 + 邀请功能 | P2 |
| Phase 10 | 存档导出功能 | P2 |
| Phase 11 | 优化 + Bug 修复 | P2 |

---

## 十三、依赖包清单

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "@prisma/client": "^5.0.0",
    "@coze/api": "^1.x",
    "jose": "^5.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/bcryptjs": "^2.4.0",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**精简说明**：
- 不使用 `styled-components`，统一用 Tailwind；
- 不使用 `axios`，统一用原生 `fetch`；
- 不使用 `uuid`，统一用 `crypto.randomUUID()`；
- 新增 `@prisma/client` + `prisma` 用于数据库操作；
- 新增 `jose` 用于 JWT 生成和验证；
- 新增 `bcryptjs` 用于密码哈希（如需要）。

---

*文档结束*
