// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SolanaProvider } from "@/providers/SolanaProvider";
import { ChatPanelProvider } from "@/providers/ChatPanelProvider";
import ChatPanel from "@/components/chat/ChatPanel";
import ChatWindow from "@/components/chat/ChatWindow"; // ✅ 추가

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "블록체인 인재 매칭 플랫폼",
    description: "블록체인 기술과 AI를 활용한 인재 매칭 및 프로젝트 관리 플랫폼",
    keywords: "블록체인, 인재매칭, AI 매칭, 스마트 계약, NFT, 평판시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko" className={inter.variable}>
        <body className="min-h-screen flex flex-col relative">
        <SolanaProvider>
            <ChatPanelProvider>
                <Header />
                <main className="flex-grow relative z-10">{children}</main>

                {/* 전역: 사이드 리스트 + 플로팅 채팅창 */}
                <ChatPanel />
                <ChatWindow />

                <Footer />
            </ChatPanelProvider>
        </SolanaProvider>
        </body>
        </html>
    );
}
