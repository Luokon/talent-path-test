import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "天赋航向｜职业倾向趣味测试",
  description: "30道情境题，发现你的优势组合、工作偏好和职业探索方向。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
