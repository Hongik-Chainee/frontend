// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SolanaProvider } from "@/providers/SolanaProvider";
import { ChatPanelProvider } from "@/providers/ChatPanelProvider";
import ChatPanel from "@/components/chat/ChatPanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "블록체인 인재 매칭 플랫폼",
  description:
      "블록체인 기술과 AI를 활용한 인재 매칭 및 프로젝트 관리 플랫폼",
  keywords:
      "블록체인, 인재매칭, AI 매칭, 스마트 계약, NFT, 평판시스템",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="ko" className={inter.variable}>
      <body className="min-h-screen flex flex-col relative">
      <SolanaProvider>
        {/* ✅ 반드시 Provider로 감싼다 */}
        <ChatPanelProvider>
          <Header />
          <main className="flex-grow relative z-10">{children}</main>

          {/* ✅ 전역에서 1번만 렌더링 */}
          <ChatPanel />

          <Footer />
        </ChatPanelProvider>
      </SolanaProvider>
      </body>
      </html>
  );
}
