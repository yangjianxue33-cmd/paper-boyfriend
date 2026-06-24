"use client";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm">
        🤵
      </div>
      <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
