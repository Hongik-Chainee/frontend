// src/components/chat/ChatPanel.tsx
'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useChatPanel } from '@/providers/ChatPanelProvider';

import { getValidAccessToken, refreshOnce } from '@/services/auth/authApi';
import { clearTokens } from '@/services/auth/tokenStorage';
import {ConversationSummary} from "@/models/chat";
import {fetchConversations} from "@/services/chat/chatApi";

// 날짜 포맷(“31분 전”, “어제”, “yyyy-MM-dd” 간단 버전)
function formatRelative(iso?: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return '방금 전';
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    if (day === 1) return '어제';
    if (day < 7) return `${day}일 전`;
    // fallback
    return d.toLocaleDateString();
}

export default function ChatPanel() {
    const { isOpen, close } = useChatPanel();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<ConversationSummary[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

    // 최초/열릴 때 토큰 체크 → 없으면 로그인 유도
    useEffect(() => {
        let mounted = true;

        const ensureAuthAndLoad = async () => {
            if (!isOpen) return;

            setError(null);
            setLoading(true);

            // 1) 토큰 확인
            let token = await getValidAccessToken();
            if (!token) {
                const ok = await refreshOnce();
                if (ok) token = await getValidAccessToken();
            }

            if (!token) {
                if (!mounted) return;
                setIsAuthed(false);
                setItems([]);
                setLoading(false);
                return;
            }

            setIsAuthed(true);

            // 2) 대화방 리스트 불러오기
            try {
                const list = await fetchConversations();
                if (!mounted) return;
                setItems(list);
            } catch (e) {
                if (!mounted) return;
                setError('대화 목록을 불러오지 못했어요.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        ensureAuthAndLoad();

        return () => {
            mounted = false;
        };
    }, [isOpen]);

    const onClickSignin = async () => {
        // 토큰 비정상 시 로컬 저장소 정리 후 로그인 페이지로
        clearTokens();
        router.push('/auth/signin');
        close();
    };

    const content = useMemo(() => {
        if (isAuthed === false) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center text-white/80">
                    <p className="mb-4 text-sm">채팅을 보려면 로그인이 필요해요.</p>
                    <button
                        onClick={onClickSignin}
                        className="rounded-lg bg-[#71FF9C] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                    >
                        로그인하러 가기 →
                    </button>
                </div>
            );
        }

        if (loading) {
            return (
                <ul className="mt-2 space-y-2 pr-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="rounded-2xl px-3 py-3 bg-white/5 animate-pulse h-16" />
                    ))}
                </ul>
            );
        }

        if (error) {
            return (
                <div className="py-10 text-center text-red-300 text-sm">
                    {error}
                </div>
            );
        }

        if (!items.length) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-white/90 font-semibold">대화가 비어있어요</p>
                    <p className="mt-1 text-white/70 text-xs">대화를 시작하면 여기에 표시됩니다.</p>
                </div>
            );
        }

        return (
            <ul className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
                {items.map((c) => (
                    <li key={c.id}>
                        <button
                            className="w-full text-left rounded-2xl px-3 py-3 hover:bg-white/10 transition flex items-center gap-3"
                            onClick={() => {
                                // 채팅방 상세 페이지로 이동(카톡처럼 작은 창 대신 상세로 가고 싶으면 라우팅)
                                // 여기서는 미니 패널 유지하므로 새 탭/새 페이지 이동 대신
                                // 페이지 내 라우팅으로 전환. 필요 시 close()로 패널 닫기.
                                close();
                                // 상세 라우트: /chat/[id]
                                router.push(`/chat/${c.id}`);
                            }}
                        >
                            {/* 아바타 */}
                            <Avatar src={c.partnerProfileImageUrl} name={c.partnerName} />

                            {/* 텍스트 */}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {c.partnerName || '상대방'}
                                    </p>
                                    <span className="ml-2 shrink-0 text-xs text-white/80">
                    {formatRelative(c.lastMessageAt)}
                  </span>
                                </div>
                                <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs text-white/80">
                                    {c.lastMessage || '메시지가 없습니다.'}
                                </p>
                            </div>

                            {/* 우측 unread badge */}
                            {c.unreadCount > 0 ? (
                                <span className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-[#71FF9C] text-[11px] font-bold text-black">
                  {c.unreadCount}
                </span>
                            ) : null}
                        </button>
                    </li>
                ))}
            </ul>
        );
    }, [isAuthed, loading, error, items, close, router]);

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={close}>
                {/* 배경 */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

                {/* 패널(카톡처럼 슬림 폭) */}
                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 flex justify-end">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom="translate-x-full" enterTo="translate-x-0"
                            leave="transform transition ease-in duration-200"
                            leaveFrom="translate-x-0" leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="pointer-events-auto w-full max-w-sm">
                                <div className="h-full flex flex-col">
                                    {/* 상단 */}
                                    <div className="relative flex items-center justify-between px-4 py-3">
                                        <Dialog.Title className="text-white/90 font-semibold">
                                            채팅
                                        </Dialog.Title>
                                        <button
                                            className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10"
                                            onClick={close}
                                            aria-label="닫기"
                                            title="닫기"
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* 카드(그라디언트 영역) */}
                                    <div className="mx-4 mb-6 rounded-3xl bg-gradient-to-b from-[#6D66F3] to-[#1E1A6B] p-4 shadow-2xl">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-white/90 font-semibold">대화방 목록</h2>
                                            </div>

                                            {content}
                                        </div>
                                    </div>

                                    <div className="pb-6" />
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}

/** 이미지 실패 시 이니셜 원 표시 */
function Avatar({ src, name }: { src?: string | null; name: string }) {
    const initials =
        (name || '')
            .split(' ')
            .map((p) => p.trim()[0])
            .filter(Boolean)
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'U';

    // Next/Image onError 대체: fill 사용 시 우회 렌더
    if (!src) {
        return (
            <div className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/20 bg-white/20 text-white text-xs font-bold">
                {initials}
            </div>
        );
    }

    return (
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/20 shrink-0 bg-white/10">
            {/* eslint-disable @next/next/no-img-element */}
            <img
                src={src}
                alt={name}
                className="h-full w-full object-cover"
                onError={(e) => {
                    const el = e.currentTarget;
                    el.onerror = null;
                    el.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
               <rect width='100%' height='100%' fill='rgba(255,255,255,0.12)'/>
               <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='white' font-family='Inter, sans-serif'>${initials}</text>
             </svg>`
                    )}`;
                }}
            />
        </div>
    );
}
