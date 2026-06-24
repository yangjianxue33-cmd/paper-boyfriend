# 纸片人男友 - 数据库设计文档

> 版本：v1.0
> 日期：2026-06-23
> 数据库：PostgreSQL
> ORM：Prisma

---

## 一、数据库选型说明

| 选型 | 说明 |
|------|------|
| **数据库** | PostgreSQL 14+ |
| **ORM** | Prisma |
| **理由** | 关系型数据模型、JSONB 支持灵活字段、与 Next.js 生态集成好 |

---

## 二、实体关系图 (ERD)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │───────│  chat_sessions│───────│   messages  │
│  (用户表)    │  1:N  │  (聊天会话表) │  1:N  │  (消息表)    │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌─────────────┐
│ user_profiles│       │  invitations │
│ (用户画像表) │       │  (邀请关系表) │
└─────────────┘       └─────────────┘
```

---

## 三、表结构详细设计

### 3.1 users（用户表）

存储用户基础信息和认证信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 用户唯一标识 |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号（登录账号）|
| nickname | VARCHAR(50) | | 用户昵称 |
| avatar | VARCHAR(500) | | 用户头像URL |
| auth_type | VARCHAR(20) | NOT NULL, DEFAULT 'phone' | 认证类型：phone/wechat |
| wechat_openid | VARCHAR(100) | UNIQUE | 微信OpenID（可选）|
| password_hash | VARCHAR(255) | | 密码哈希（如需要）|
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 状态：active/blocked |
| last_login_at | TIMESTAMP | | 最后登录时间 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_users_phone` ON phone（登录查询）
- `idx_users_wechat` ON wechat_openid（微信登录查询）

---

### 3.2 user_profiles（用户画像表）

存储用户的个性化信息，用于AI生成针对性回复。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 画像唯一标识 |
| user_id | UUID | NOT NULL, FOREIGN KEY → users.id, UNIQUE | 关联用户 |
| personality | VARCHAR(50) | | 性格倾向 |
| age_range | VARCHAR(20) | | 年龄段：20-25/26-30/30+ |
| hobbies | JSONB | DEFAULT '[]' | 兴趣爱好数组 |
| emotional_pattern | VARCHAR(50) | | 情绪处理模式 |
| work_experience | VARCHAR(50) | | 工作经验 |
| preferences | JSONB | DEFAULT '{}' | 其他偏好（扩展字段）|
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_profiles_user_id` ON user_id

---

### 3.3 characters（角色表）

存储虚拟男友角色配置。此表数据由运营人员维护，初始化时插入。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | VARCHAR(50) | PRIMARY KEY | 角色唯一标识（如：ceo, racer）|
| name | VARCHAR(50) | NOT NULL | 角色名称 |
| type | VARCHAR(50) | NOT NULL | 角色类型 |
| avatar | VARCHAR(500) | | 头像URL |
| occupation | VARCHAR(50) | | 职业 |
| personality | JSONB | NOT NULL, DEFAULT '[]' | 性格标签数组 |
| backstory | TEXT | | 背景故事 |
| mbti | VARCHAR(10) | | MBTI类型 |
| weaknesses | TEXT | | 内心脆弱点描述 |
| system_prompt | TEXT | NOT NULL | AI系统提示词 |
| voice_id | VARCHAR(100) | | TTS音色ID |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 排序顺序 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 是否启用 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
- `idx_characters_active` ON is_active, sort_order

---

### 3.4 chat_sessions（聊天会话表）

存储用户与每个角色的聊天会话。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 会话唯一标识 |
| user_id | UUID | NOT NULL, FOREIGN KEY → users.id | 关联用户 |
| character_id | VARCHAR(50) | NOT NULL, FOREIGN KEY → characters.id | 关联角色 |
| title | VARCHAR(100) | | 会话标题（可自动生成）|
| last_message_at | TIMESTAMP | | 最后消息时间 |
| message_count | INTEGER | NOT NULL, DEFAULT 0 | 消息数量 |
| is_active | BOOLEAN | NOT NULL, DEFAULT true | 是否活跃 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引**：
- `idx_sessions_user` ON user_id, last_message_at DESC
- `idx_sessions_character` ON character_id
- `idx_sessions_user_character` ON user_id, character_id（用于判断是否已有会话）

---

### 3.5 messages（消息表）

存储聊天消息内容。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 消息唯一标识 |
| session_id | UUID | NOT NULL, FOREIGN KEY → chat_sessions.id | 关联会话 |
| role | VARCHAR(20) | NOT NULL | 发送者：user/assistant |
| content | TEXT | NOT NULL | 消息文字内容 |
| content_type | VARCHAR(20) | NOT NULL, DEFAULT 'text' | 类型：text/image/choice/system |
| audio_url | VARCHAR(500) | | 语音URL |
| image_url | VARCHAR(500) | | 图片URL |
| metadata | JSONB | DEFAULT '{}' | 扩展信息（如选择题选项）|
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
- `idx_messages_session` ON session_id, created_at DESC
- `idx_messages_created` ON created_at

---

### 3.6 invitations（邀请关系表）

存储用户邀请关系。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 邀请唯一标识 |
| inviter_id | UUID | NOT NULL, FOREIGN KEY → users.id | 邀请人 |
| invitee_id | UUID | FOREIGN KEY → users.id | 被邀请人（注册后填充）|
| invite_code | VARCHAR(100) | NOT NULL, UNIQUE | 邀请码 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 状态：pending/registered/completed |
| invited_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 邀请时间 |
| registered_at | TIMESTAMP | | 被邀请人注册时间 |

**索引**：
- `idx_invitations_code` ON invite_code
- `idx_invitations_inviter` ON inviter_id

---

### 3.7 user_favorites（用户收藏表）

存储用户收藏的聊天片段。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 收藏唯一标识 |
| user_id | UUID | NOT NULL, FOREIGN KEY → users.id | 关联用户 |
| session_id | UUID | NOT NULL, FOREIGN KEY → chat_sessions.id | 关联会话 |
| message_ids | JSONB | NOT NULL, DEFAULT '[]' | 收藏的消息ID数组 |
| title | VARCHAR(200) | | 收藏标题 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引**：
- `idx_favorites_user` ON user_id, created_at DESC

---

## 四、Prisma Schema 定义

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  phone         String    @unique @db.VarChar(20)
  nickname      String?   @db.VarChar(50)
  avatar        String?   @db.VarChar(500)
  authType      String    @default("phone") @map("auth_type") @db.VarChar(20)
  wechatOpenid  String?   @unique @map("wechat_openid") @db.VarChar(100)
  passwordHash  String?   @map("password_hash") @db.VarChar(255)
  status        String    @default("active") @db.VarChar(20)
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 关联
  profile    UserProfile?
  sessions   ChatSession[]
  invitationsSent   Invitation[] @relation("Inviter")
  invitationsReceived Invitation[] @relation("Invitee")
  favorites  UserFavorite[]

  @@index([phone])
  @@index([wechatOpenid])
  @@map("users")
}

// 用户画像表
model UserProfile {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId           String   @unique @map("user_id") @db.Uuid
  personality      String?  @db.VarChar(50)
  ageRange         String?  @map("age_range") @db.VarChar(20)
  hobbies          Json?    @default("[]")
  emotionalPattern String?  @map("emotional_pattern") @db.VarChar(50)
  workExperience   String?  @map("work_experience") @db.VarChar(50)
  preferences      Json?    @default("{}")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("user_profiles")
}

// 角色表
model Character {
  id            String   @id @db.VarChar(50)
  name          String   @db.VarChar(50)
  type          String   @db.VarChar(50)
  avatar        String?  @db.VarChar(500)
  occupation    String?  @db.VarChar(50)
  personality   Json     @default("[]")
  backstory     String?
  mbti          String?  @db.VarChar(10)
  weaknesses    String?
  systemPrompt  String   @map("system_prompt")
  voiceId       String?  @map("voice_id") @db.VarChar(100)
  sortOrder     Int      @default(0) @map("sort_order")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")

  sessions ChatSession[]

  @@index([isActive, sortOrder])
  @@map("characters")
}

// 聊天会话表
model ChatSession {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId        String   @map("user_id") @db.Uuid
  characterId   String   @map("character_id") @db.VarChar(50)
  title         String?  @db.VarChar(100)
  lastMessageAt DateTime? @map("last_message_at")
  messageCount  Int      @default(0) @map("message_count")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character Character @relation(fields: [characterId], references: [id])
  messages Message[]
  favorites UserFavorite[]

  @@index([userId, lastMessageAt])
  @@index([characterId])
  @@index([userId, characterId])
  @@map("chat_sessions")
}

// 消息表
model Message {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId   String   @map("session_id") @db.Uuid
  role        String   @db.VarChar(20)
  content     String   @db.Text
  contentType String   @default("text") @map("content_type") @db.VarChar(20)
  audioUrl    String?  @map("audio_url") @db.VarChar(500)
  imageUrl    String?  @map("image_url") @db.VarChar(500)
  metadata    Json?    @default("{}")
  createdAt   DateTime @default(now()) @map("created_at")

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, createdAt])
  @@map("messages")
}

// 邀请关系表
model Invitation {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inviterId     String    @map("inviter_id") @db.Uuid
  inviteeId     String?   @map("invitee_id") @db.Uuid
  inviteCode    String    @unique @map("invite_code") @db.VarChar(100)
  status        String    @default("pending") @db.VarChar(20)
  invitedAt     DateTime  @default(now()) @map("invited_at")
  registeredAt  DateTime? @map("registered_at")

  inviter User  @relation("Inviter", fields: [inviterId], references: [id])
  invitee User? @relation("Invitee", fields: [inviteeId], references: [id])

  @@index([inviteCode])
  @@index([inviterId])
  @@map("invitations")
}

// 用户收藏表
model UserFavorite {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  sessionId   String   @map("session_id") @db.Uuid
  messageIds  Json     @default("[]") @map("message_ids")
  title       String?  @db.VarChar(200)
  createdAt   DateTime @default(now()) @map("created_at")

  user    User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("user_favorites")
}
```

---

## 五、环境变量配置

```env
# .env.local

# 数据库连接
DATABASE_URL="postgresql://用户名:密码@localhost:5432/paper_boyfriend?schema=public"

# 扣子 API
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_bot_id

# 火山引擎
VOLC_ACCESS_KEY=your_access_key
VOLC_SECRET_KEY=your_secret_key

# JWT 密钥（用于登录态）
JWT_SECRET=your_jwt_secret_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 六、数据初始化脚本

### 6.1 角色数据初始化

```sql
-- 插入5个预设角色
INSERT INTO characters (id, name, type, occupation, personality, backstory, mbti, weaknesses, system_prompt, voice_id, sort_order) VALUES
('ceo', '陆沉', 'ceo', '互联网公司CEO', '["高冷", "内心柔软", "有脆弱感"]', '拥有商业帝国但内心孤独，只对信任的人展现柔软一面', 'INTJ', '害怕被抛弃，习惯用工作麻痹自己', '你是陆沉，一位互联网公司CEO。你表面高冷、理性，但内心渴望被理解。你说话简洁有力，偶尔流露温柔。你正在和用户（一位普通上班族女性）聊天，请根据用户画像调整语气。', 'volc_ceo_voice', 1),
('racer', '萧逸', 'racer', '赛车手', '["开朗", "调皮", "少年感"]', '永远意气风发的赛车手，但也有细腻温柔的一面', 'ESTP', '害怕失去速度感带来的自由', '你是萧逸，一位赛车手。你性格开朗直接，有点调皮，充满少年感。说话活泼热情，偶尔正经。你正在和用户聊天，请根据用户画像调整语气。', 'volc_racer_voice', 2),
('doctor', '黎深', 'doctor', '心外科医生', '["沉稳", "体贴", "治愈系"]', '见过太多生死的心外科医生，更懂得珍惜当下', 'ISFJ', '害怕无法拯救重要的人', '你是黎深，一位心外科医生。你沉稳体贴，善于倾听，有治愈系气质。说话温柔但有力量。你正在和用户聊天，请根据用户画像调整语气。', 'volc_doctor_voice', 3),
('artist', '祁煜', 'artist', '自由画家', '["浪漫", "神秘", "傲娇"]', '看起来玩世不恭的自由画家，内心其实很深情', 'INFP', '害怕自己的感情不被理解', '你是祁煜，一位自由画家。你浪漫神秘，有点傲娇，有艺术气息。说话文艺感性，偶尔毒舌。你正在和用户聊天，请根据用户画像调整语气。', 'volc_artist_voice', 4),
('police', '夏以昼', 'police', '特警', '["正义", "守护", "笨拙"]', '从小一起长大的特警，默默守护但不善表达', 'ISTJ', '害怕保护不了重要的人', '你是夏以昼，一位特警。你正义感强，是守护型人格，有点笨拙。说话直接真诚，偶尔害羞。你正在和用户聊天，请根据用户画像调整语气。', 'volc_police_voice', 5);
```

---

## 七、关键查询示例

### 7.1 获取用户的所有会话（按最后消息时间倒序）

```sql
SELECT s.*, c.name as character_name, c.avatar as character_avatar
FROM chat_sessions s
JOIN characters c ON s.character_id = c.id
WHERE s.user_id = $1 AND s.is_active = true
ORDER BY s.last_message_at DESC;
```

### 7.2 获取会话的最近消息（分页）

```sql
SELECT * FROM messages
WHERE session_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
```

### 7.3 获取用户画像（用于AI提示词）

```sql
SELECT * FROM user_profiles
WHERE user_id = $1;
```

### 7.4 统计邀请效果

```sql
SELECT 
  inviter_id,
  COUNT(*) as total_invited,
  COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered_count
FROM invitations
WHERE inviter_id = $1
GROUP BY inviter_id;
```

---

*文档结束*
