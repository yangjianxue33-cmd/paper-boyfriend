"use client";

import { Message } from "@/lib/types";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-10">
          打个招呼，开始聊天吧～
        </p>
      )}
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
