"use client";

import Link from "next/link";
import { Character } from "@/lib/types";

interface ChatHeaderProps {
  character: Character;
}

export function ChatHeader({ character }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#f5f5f5] border-b border-gray-200 px-4 py-3 flex items-center gap-3">
      <Link
        href="/"
        className="text-gray-600 text-lg font-medium hover:text-gray-900"
      >
        ←
      </Link>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-lg">
        🤵
      </div>
      <div className="flex-1">
        <h1 className="font-semibold text-gray-900">{character.name}</h1>
        <p className="text-xs text-gray-500 truncate">{character.occupation}</p>
      </div>
    </header>
  );
}
