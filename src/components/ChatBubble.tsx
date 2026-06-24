"use client";

import { Message } from "@/lib/types";
import { formatTime } from "@/lib/utils";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 mb-4 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
          isUser
            ? "bg-[#07c160] text-white"
            : "bg-gradient-to-br from-gray-200 to-gray-300"
        }`}
      >
        {isUser ? "我" : "🤵"}
      </div>

      <div className={`max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <p className="text-xs text-gray-400 mb-1 px-1">
          {formatTime(message.timestamp)}
        </p>

        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="AI 发送的图片"
            className="rounded-lg max-w-full mb-2 shadow-sm"
          />
        )}

        {message.type === "text" && (
          <div
            className={`px-4 py-2.5 rounded-lg text-[15px] leading-relaxed shadow-sm ${
              isUser
                ? "bg-[#95ec69] text-gray-900 rounded-tr-sm"
                : "bg-white text-gray-900 rounded-tl-sm"
            }`}
          >
            {message.content}
          </div>
        )}

        {message.type === "choice" && (
          <div className="bg-white rounded-lg p-4 shadow-sm rounded-tl-sm">
            <p className="text-gray-900 mb-3">{message.content}</p>
          </div>
        )}
      </div>
    </div>
  );
}
