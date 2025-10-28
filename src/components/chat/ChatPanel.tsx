'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useChatPanel } from '@/providers/ChatPanelProvider';

type ChatItem = {
    id: string;
    name: string;
    avatar?: string;
    preview: string;
    time: string;
    unread?: number;
};

const demo: ChatItem[] = [
    { id: '1', name: 'Timothy Smith', avatar: '/avatar-timothy.png', preview: "Hello! My name is Timothy.\nI'd like to have a conversation about your resume.", time: '31 min ago', unread: 2 },
    { id: '2', name: 'Timothy Smith', avatar: '/avatar-timothy.png', preview: "Hello! My name is Timothy.\nI'd like to have a conversation about your resume.", time: '2 hour ago' },
    { id: '3', name: 'Timothy Smith', avatar: '/avatar-timothy.png', preview: "Hello! My name is Timothy.\nI'd like to have a conversation about your resume.", time: '3 days ago', unread: 3 },
    { id: '4', name: 'Timothy Smith', avatar: '/avatar-timothy.png', preview: "Hello! My name is Timothy.\nI'd like to have a conversation about your resume.", time: 'a week ago', unread: 5 },
    { id: '5', name: 'Timothy Smith', avatar: '/avatar-timothy.png', preview: "Hello! My name is Timothy.\nI'd like to have a conversation about your resume.", time: 'a week ago', unread: 5 },
];

export default function ChatPanel() {
    const { isOpen, close, openRoom } = useChatPanel();

    const enterRoom = (id: string) => {
        openRoom(id); // ✅ 플로팅 채팅창 열기
    };

    const Avatar = ({ name, src }: { name: string; src?: string }) => {
        if (!src) {
            const init = (name.split(' ')[0]?.[0] ?? 'U') + (name.split(' ')[1]?.[0] ?? '');
            return (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 text-xs font-semibold">
                    {init.toUpperCase()}
                </div>
            );
        }
        return (
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-white/20 shrink-0">
                {/* 이미지가 없으면 next/image가 에러를 던지니 public에 파일이 없을 경우 위 폴백으로 바꾸세요 */}
                <Image src={src} alt={name} fill sizes="40px" />
            </div>
        );
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={close}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" />
                </Transition.Child>

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
                                    <div className="relative flex items-center justify-between px-4 py-3">
                                        <Dialog.Title className="sr-only">Chatting</Dialog.Title>
                                        <div />
                                        <button
                                            className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10"
                                            onClick={close}
                                        >
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="mx-4 mb-6 rounded-3xl bg-gradient-to-b from-[#6D66F3] to-[#1E1A6B] p-4 shadow-2xl">
                                        <div className="rounded-2xl bg-white/10 p-3">
                                            <h2 className="text-white/90 font-semibold">Chatting</h2>

                                            <ul className="mt-2 max-h-[70vh] overflow-y-auto pr-1">
                                                {demo.map((c) => (
                                                    <li key={c.id}>
                                                        <button
                                                            onClick={() => enterRoom(c.id)}
                                                            className="w-full text-left rounded-2xl px-3 py-3 hover:bg-white/10 transition flex items-center gap-3"
                                                        >
                                                            <Avatar name={c.name} src={c.avatar} />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                                                                    <span className="ml-2 shrink-0 text-xs text-white/80">{c.time}</span>
                                                                </div>
                                                                <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs text-white/80">
                                                                    {c.preview}
                                                                </p>
                                                            </div>
                                                            {typeof c.unread === 'number' ? (
                                                                <span className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-[#71FF9C] text-[11px] font-bold text-black">
                                  {c.unread}
                                </span>
                                                            ) : null}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
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
