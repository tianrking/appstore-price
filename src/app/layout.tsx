import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "App Store 价格查询",
  description: "查询和比较不同地区 App Store 应用价格与内购项目",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
