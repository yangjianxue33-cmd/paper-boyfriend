import { NextRequest, NextResponse } from "next/server";
import { CozeAPI, COZE_CN_BASE_URL, RoleType, ChatStatus } from "@coze/api";
import { Message } from "@/lib/types";
import { CHARACTERS } from "@/lib/constants";
import { buildSystemPrompt } from "@/prompts/systemPrompt";

const client = new CozeAPI({
  token: process.env.COZE_API_KEY || "",
  baseURL: COZE_CN_BASE_URL,
});

interface ChatRequestBody {
  characterId: string;
  userMessage: string;
  history: Message[];
}

function parseInstructions(content: string): {
  cleanContent: string;
  instructions: { type: "image" | "choice"; payload: unknown }[];
} {
  const instructions: { type: "image" | "choice"; payload: unknown }[] = [];
  let cleanContent = content;

  // 解析 [IMAGE: 场景描述]
  const imageRegex = /\[IMAGE:\s*([^\]]+)\]/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    instructions.push({ type: "image", payload: match[1].trim() });
  }
  cleanContent = cleanContent.replace(imageRegex, "").trim();

  // 解析 [CHOICE: 问题 | 选项A | 选项B | ...]
  const choiceRegex = /\[CHOICE:\s*([^\]]+)\]/g;
  while ((match = choiceRegex.exec(content)) !== null) {
    const parts = match[1].split("|").map((s) => s.trim());
    if (parts.length >= 2) {
      instructions.push({
        type: "choice",
        payload: {
          question: parts[0],
          options: parts.slice(1).map((label) => ({ label, value: label })),
        },
      });
    }
  }
  cleanContent = cleanContent.replace(choiceRegex, "").trim();

  return { cleanContent, instructions };
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { characterId, userMessage, history } = body;

    const character = CHARACTERS.find((c) => c.id === characterId);
    if (!character) {
      return NextResponse.json({ error: "角色不存在" }, { status: 400 });
    }

    const botId = process.env.COZE_BOT_ID;
    if (!botId) {
      return NextResponse.json({ error: "未配置 Coze Bot ID" }, { status: 500 });
    }

    const systemPrompt = buildSystemPrompt(character, {});

    const additionalMessages = [
      {
        role: RoleType.User,
        content: systemPrompt,
        content_type: "text" as const,
      },
      ...history.map((msg) => ({
        role: msg.role === "user" ? RoleType.User : RoleType.Assistant,
        content: msg.content,
        content_type: "text" as const,
      })),
      {
        role: RoleType.User,
        content: userMessage,
        content_type: "text" as const,
      },
    ];

    const result = await client.chat.createAndPoll({
      bot_id: botId,
      user_id: "paper-boyfriend-user",
      additional_messages: additionalMessages,
    });

    if (result.chat.status !== ChatStatus.COMPLETED || !result.messages) {
      return NextResponse.json(
        { error: "对话未正常完成" },
        { status: 500 }
      );
    }

    const answerMessage = result.messages.find(
      (m) => m.role === "assistant" && m.type === "answer"
    );

    if (!answerMessage) {
      return NextResponse.json({ error: "未获取到回复" }, { status: 500 });
    }

    const rawContent = answerMessage.content as string;
    const { cleanContent, instructions } = parseInstructions(rawContent);

    return NextResponse.json({
      content: cleanContent || rawContent,
      instructions,
    });
  } catch (error) {
    console.error("Coze chat error:", error);
    return NextResponse.json(
      { error: "对话服务暂时不可用" },
      { status: 500 }
    );
  }
}
