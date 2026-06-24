"use client";

import Link from "next/link";
import { useCharacterStore } from "@/stores/characterStore";
import { APP_NAME } from "@/lib/constants";

export default function Home() {
  const characters = useCharacterStore((state) => state.characters);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="bg-[#07c160] text-white px-6 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">{APP_NAME}</h1>
        <p className="text-white/90 text-sm">选择一个专属男友，开始你们的甜蜜对话 💬</p>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <p className="text-sm text-gray-500 mb-4 px-1">今日推荐</p>
        <div className="space-y-4">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/chat/${character.id}`}
              className="block bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 flex items-center justify-center text-2xl">
                  🤵
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {character.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 bg-[#07c160]/10 text-[#07c160] rounded-full">
                      {character.occupation}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {character.personality.join(" · ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {character.backstory}
                  </p>
                </div>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        刷新页面会清空当前会话 · 免费体验
      </footer>
    </div>
  );
}
