import { ChatResponse, Message } from "@/lib/types";

interface ChatRequestBody {
  characterId: string;
  userMessage: string;
  history: Message[];
}

export async function sendChatMessage(
  characterId: string,
  userMessage: string,
  history: Message[]
): Promise<ChatResponse> {
  const body: ChatRequestBody = { characterId, userMessage, history };
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("消息发送失败");
  }

  return res.json();
}
