import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "纸片人男友 - AI 虚拟恋人聊天",
  description: "免费的、有人设的 AI 虚拟男友聊天产品",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
