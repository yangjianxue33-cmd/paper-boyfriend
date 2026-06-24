"use client";

import { useParams } from "next/navigation";
import { useCharacterStore } from "@/stores/characterStore";
import { useChat } from "@/hooks/useChat";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList } from "@/components/MessageList";
import { InputArea } from "@/components/InputArea";
import Link from "next/link";

export default function ChatPage() {
  const params = useParams();
  const characterId = params.characterId as string;
  const character = useCharacterStore((state) =>
    state.getCharacterById(characterId)
  );
  const { messages, isLoading, sendMessage } = useChat(characterId);

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        角色不存在，<Link href="/" className="text-blue-500">返回首页</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      <ChatHeader character={character} />
      <MessageList messages={messages} isLoading={isLoading} />
      <InputArea onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
