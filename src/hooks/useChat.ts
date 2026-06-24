import { useCallback } from "react";
import { Message } from "@/lib/types";
import { useChatStore } from "@/stores/chatStore";
import { sendChatMessage } from "@/services/chat";
import { generateImage } from "@/services/image";
import { generateId } from "@/lib/utils";

export function useChat(characterId: string) {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
        type: "text",
      };
      addMessage(userMessage);
      setLoading(true);

      try {
        const response = await sendChatMessage(
          characterId,
          text,
          [...messages, userMessage].slice(-20)
        );

        const aiMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response.content,
          timestamp: Date.now(),
          type: "text",
        };
        addMessage(aiMessage);

        // 处理特殊指令
        if (response.instructions) {
          for (const instruction of response.instructions) {
            if (instruction.type === "image" && typeof instruction.payload === "string") {
              try {
                const imageUrl = await generateImage(
                  instruction.payload,
                  characterId
                );
                if (imageUrl) {
                  addMessage({
                    id: generateId(),
                    role: "assistant",
                    content: "",
                    imageUrl,
                    timestamp: Date.now(),
                    type: "image",
                  });
                }
              } catch {
                // 图片生成失败时静默忽略，不影响文字回复
              }
            }
          }
        }
      } catch {
        addMessage({
          id: generateId(),
          role: "assistant",
          content: "消息发送失败，点击重试",
          timestamp: Date.now(),
          type: "text",
        });
      } finally {
        setLoading(false);
      }
    },
    [characterId, messages, addMessage, setLoading]
  );

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
