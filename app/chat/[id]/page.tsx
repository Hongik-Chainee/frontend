// src/app/chat/[id]/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatWsClient } from '@/services/chat/chatWs';
import { fetchMessages, markRead, sendMessage, ChatMessage } from '@/services/chat/chatApi';

export default function ChatRoomPage() {
    const { id } = useParams<{ id: string }>();
    const conversationId = Number(id);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // 하나만 재사용
    const ws = useMemo(() => new ChatWsClient(), []);

    useEffect(() => {
        // 1) 초기 메시지 로드 + 읽음 처리
        (async () => {
            const page0 = await fetchMessages(conversationId, 0, 50);
            setMessages(page0.content || []);
            await markRead(conversationId);
        })();
    }, [conversationId]);

    useEffect(() => {
        // 2) WS 구독
        let unsub: any;
        (async () => {
            const sub = await ws.subscribeConversation(conversationId, (incoming) => {
                setMessages((prev) => [...prev, incoming]);
            });
            unsub = () => sub.unsubscribe();
        })();

        return () => {
            unsub?.();
            ws.deactivate();
        };
    }, [conversationId, ws]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const onSend = async () => {
        const body = text.trim();
        if (!body) return;
        await ws.send(conversationId, body);
        // 낙관적 업데이트가 필요하면 여기서 바로 push 가능 (지금은 서버 echo로만 추가)
        setText('');
    };

    return (
        <div className="fixed right-4 bottom-4 z-[110] w-[380px] max-w-[92vw] rounded-2xl border border-white/10 bg-[#0f1120]/95 backdrop-blur shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="text-sm font-semibold text-white">대화방 #{conversationId}</div>
            </div>

            {/* 메시지 리스트 */}
            <div className="h-[420px] overflow-y-auto p-3 space-y-2">
                {messages.map((m) => (
                    <div key={m.id} className="flex">
                        {/* 단순하게 전부 우측 정렬 (필요시 m.sender.id 비교해 좌/우 나누기) */}
                        <div className="ml-auto max-w-[80%] rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
                            {m.content}
                            <div className="mt-1 text-[10px] opacity-60">
                                {new Date(m.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* 입력영역 */}
            <div className="flex items-center gap-2 p-3 border-t border-white/10">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => (e.key === 'Enter' ? onSend() : undefined)}
                    placeholder="메시지를 입력하세요…"
                    className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                />
                <button
                    onClick={onSend}
                    className="rounded-lg bg-[#71FF9C] px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
                >
                    전송
                </button>
            </div>
        </div>
    );
}
