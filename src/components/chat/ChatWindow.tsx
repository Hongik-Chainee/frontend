'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useChatPanel } from '@/providers/ChatPanelProvider';

type Message = { id: number; sender: 'me' | 'other'; text: string };

// 데모 메시지 (id별로 다르게 하고 싶으면 map으로 관리)
const seed: Message[] = [
    { id: 1, sender: 'other', text: "Hello! My name is Timothy.\nI’d like to have a conversation about your resume." },
    { id: 2, sender: 'me', text: "Nice to meet you.\nWhich part of the resume you want to talk about?" },
    { id: 3, sender: 'other', text: "I found that you are interested of desktop developing." },
    { id: 4, sender: 'other', text: "I thought your skills are great,\nbut we are looking for someone who has mobile experience." },
    { id: 5, sender: 'me', text: "Oh, But I have experience of making mobile app service too.\nI haven’t uploaded it yet.\nI’ll send you about it so could you check it later please?" },
];

export default function ChatWindow() {
    const { roomId, isRoomOpen, closeRoom } = useChatPanel();

    // roomId 기반으로 메시지를 불러온다고 가정
    const [messages, setMessages] = useState<Message[]>(seed);
    const [input, setInput] = useState('');

    // 데모 프로필
    const profile = useMemo(
        () => ({
            name: 'Timothy Smith',
            role: 'From DID Mobile App Frontend Developer',
            avatar: '/avatar-timothy.png', // 없으면 아래 폴백
        }),
        []
    );

    if (!isRoomOpen) return null;

    const Avatar = ({ name, src, size = 36 }: { name: string; src?: string; size?: number }) => {
        if (!src) {
            const parts = name.trim().split(/\s+/);
            const init = ((parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '')).toUpperCase();
            return (
                <div
                    className="grid place-items-center rounded-full bg-white/10 ring-1 ring-white/20 text-[10px] font-semibold text-white/80"
                    style={{ width: size, height: size }}
                >
                    {init}
                </div>
            );
        }
        return (
            <div className="relative overflow-hidden rounded-full ring-1 ring-white/20" style={{ width: size, height: size }}>
                <Image src={src} alt={name} fill sizes={`${size}px`} />
            </div>
        );
    };

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: input }]);
        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[110] w-[380px] max-w-sm rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] ring-1 ring-white/10 overflow-hidden">
            {/* 배경 카드 */}
            <div className="bg-gradient-to-b from-[#6D66F3] to-[#1E1A6B]">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar name={profile.name} src={profile.avatar} size={40} />
                        <div>
                            <div className="text-sm font-semibold text-white">{profile.name}</div>
                            <div className="text-[11px] text-[#71FF9C]">{profile.role}</div>
                        </div>
                    </div>
                    <button
                        className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10"
                        onClick={closeRoom}
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* 본문 */}
                <div className="max-h-[480px] overflow-y-auto px-4 py-3 space-y-3">
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

                {/* 하단 입력 */}
                <div className="border-t border-white/10 p-3">
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 text-[11px] font-semibold rounded-xl bg-[#B894F9]/30 text-white border border-[#B894F9]/40 hover:bg-[#B894F9]/40 transition">
                            File
                        </button>
                        <button className="px-3 py-2 text-[11px] font-semibold rounded-xl bg-[#71FF9C]/90 text-black hover:bg-[#71FF9C] transition">
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
                                className="ml-2 px-3 py-1 text-[11px] font-bold bg-[#71FF9C]/90 text-black rounded-xl hover:bg-[#71FF9C]"
                            >
                                SEND
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
