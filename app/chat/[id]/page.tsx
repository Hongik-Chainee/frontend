'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type Message = {
    id: number;
    sender: 'me' | 'other';
    text: string;
};

export default function ChatRoomPage() {
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'other', text: "Hello! My name is Timothy.\nI’d like to have a conversation about your resume." },
        { id: 2, sender: 'me', text: "Nice to meet you.\nWhich part of the resume you want to talk about?" },
        { id: 3, sender: 'other', text: "I found that you are interested of desktop developing." },
        { id: 4, sender: 'other', text: "I thought your skills are great,\nbut we are looking for someone who has mobile experience." },
        { id: 5, sender: 'me', text: "Oh, But I have experience of making mobile app service too.\nI haven’t uploaded it yet.\nI’ll send you about it so could you check it later please?" },
        { id: 6, sender: 'other', text: "I’ll send you it tonight." },
    ]);

    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'me', text: input }]);
        setInput('');
    };

    return (
        <div className="flex h-[100vh] flex-col bg-gradient-to-b from-[#6D66F3] to-[#1E1A6B] text-white">
            {/* 상단 헤더 */}
            <header className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <button className="p-1 rounded-full hover:bg-white/10" onClick={() => router.back()}>
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20">
                            <Image src="/avatar-timothy.png" alt="Timothy" fill sizes="40px" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Timothy Smith</p>
                            <p className="text-xs text-[#71FF9C]">From DID Mobile App Frontend Developer</p>
                        </div>
                    </div>
                </div>
                <button className="p-1 rounded-full hover:bg-white/10" onClick={() => router.push('/')}>
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </header>

            {/* 본문 채팅 영역 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] whitespace-pre-wrap px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                                msg.sender === 'me'
                                    ? 'bg-[#7F7DFF] text-white rounded-br-none'
                                    : 'bg-white/10 text-white rounded-bl-none'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* 하단 입력창 */}
            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2">
                    <button className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#B894F9]/30 text-white border border-[#B894F9]/40 hover:bg-[#B894F9]/40 transition">
                        File
                    </button>
                    <button className="px-3 py-2 text-xs font-semibold rounded-xl bg-[#71FF9C]/90 text-black hover:bg-[#71FF9C] transition">
                        Make a contract
                    </button>
                    <div className="flex-1 flex items-center bg-white/10 rounded-2xl px-3">
                        <input
                            className="flex-1 bg-transparent text-sm text-white placeholder-white/60 outline-none py-2"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="ml-2 px-3 py-1 text-xs font-bold bg-[#71FF9C]/90 text-black rounded-xl hover:bg-[#71FF9C]"
                        >
                            SEND
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
