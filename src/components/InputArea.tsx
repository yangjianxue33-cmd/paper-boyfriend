"use client";

import { useState, FormEvent } from "react";

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f7f7f7] border-t border-gray-200 p-3 flex gap-3 items-center"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "对方正在输入…" : "输入消息…"}
        disabled={disabled}
        className="flex-1 px-4 py-2 rounded-full bg-white border border-gray-200 outline-none focus:border-[#07c160] disabled:bg-gray-100 text-[15px]"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-5 py-2 bg-[#07c160] text-white rounded-full text-[15px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </form>
  );
}
