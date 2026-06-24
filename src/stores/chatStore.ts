import { create } from "zustand";
import { Message } from "@/lib/types";

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentCharacterId: string | null;
  addMessage: (msg: Message) => void;
  setLoading: (loading: boolean) => void;
  setCurrentCharacterId: (id: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  currentCharacterId: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setCurrentCharacterId: (id) => set({ currentCharacterId: id }),
  clearChat: () => set({ messages: [], currentCharacterId: null }),
}));
