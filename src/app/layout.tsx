import type { Metadata } from "next";
import { Noto_Sans_SC, Source_Serif_4 } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "纽约世界美食地图",
  description:
    "按国家探索纽约市五大区较少见的世界菜系。数据与页面分离，所有餐厅事实都可追溯到来源。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSans.variable} ${sourceSerif.variable} bg-[color:var(--background)] text-base antialiased`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[color:var(--card)] focus:px-3 focus:py-2"
        >
          跳到主要内容
        </a>
        <AppHeader />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
