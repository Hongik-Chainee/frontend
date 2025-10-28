'use client';

import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import { refreshOnce, getValidAccessToken } from '@/services/auth/authApi';
import { clearTokens } from '@/services/auth/tokenStorage';
import { useChatPanel } from '@/providers/ChatPanelProvider';

const navigation = [
    { name: 'Project', href: '/projects' },
    { name: 'Talent', href: '/talent' },
    { name: 'Profile', href: '/profile' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

function WalletStatus() {
    const { publicKey, connected, disconnect } = useWallet();
    const { setVisible } = useWalletModal();

    const address = useMemo(() => publicKey?.toBase58() ?? '', [publicKey]);
    const short = useMemo(
        () => (address ? `${address.slice(0, 4)}...${address.slice(-4)}` : ''),
        [address]
    );

    if (!connected) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="rounded-lg bg-[#71FF9C] px-3 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
                지갑 연결하기 →
            </button>
        );
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(address);
        } catch {}
    };

    return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
            <span className="inline-block h-2 w-2 rounded-full bg-[#71FF9C]" />
            <span className="font-mono">{short}</span>
            <button onClick={copy} className="text-xs opacity-80 hover:opacity-100">
                복사
            </button>
            <span className="opacity-30">|</span>
            <button
                onClick={() => disconnect()}
                className="text-xs opacity-80 hover:opacity-100"
            >
                해제
            </button>
        </div>
    );
}

/** ✅ 채팅 버튼: 토큰 검사 → 없으면 /auth/signin, 있으면 패널 오픈 */
function ChatButton() {
    const router = useRouter();
    const { open } = useChatPanel();

    const onClickChat = async () => {
        let token = await getValidAccessToken();
        if (!token) {
            const ok = await refreshOnce();
            if (!ok) {
                clearTokens();
                router.push('/auth/signin'); // ✅ 변경된 경로
                return;
            }
            token = await getValidAccessToken();
            if (!token) {
                router.push('/auth/signin'); // ✅ 변경된 경로
                return;
            }
        }
        open(); // ✅ 인증 통과 시 채팅 패널 오픈
    };

    return (
        <button
            type="button"
            className="p-1 text-gray-300 hover:text-white"
            onClick={onClickChat}
            aria-label="채팅 보기"
            title="채팅"
        >
            <ChatBubbleLeftIcon className="h-6 w-6" />
        </button>
    );
}

export default function Header() {
    return (
        <Disclosure as="nav" className="bg-transparent relative z-20">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 items-center justify-between">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Link href="/" className="flex items-center space-x-2">
                                        <span className="text-white font-bold text-2xl">Chainee</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 데스크톱 */}
                            <div className="hidden sm:flex sm:items-center sm:space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                {/* 채팅 버튼 */}
                                <ChatButton />

                                {/* 알림 버튼 */}
                                <button
                                    type="button"
                                    className="ml-4 p-1 text-gray-300 hover:text-white"
                                    aria-label="알림 보기"
                                    title="알림"
                                >
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>

                                {/* 지갑 */}
                                <WalletStatus />
                            </div>

                            {/* 모바일 메뉴 */}
                            <div className="-mr-2 flex items-center sm:hidden">
                                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent">
                                    <span className="sr-only">메뉴 열기</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                        </div>
                    </div>

                    {/* 모바일 메뉴 패널 */}
                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className={classNames(
                                        'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'block rounded-md px-3 py-2 text-base font-medium'
                                    )}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}

                            <div className="flex items-center gap-3 px-3 py-2">
                                <ChatButton />
                                <button
                                    type="button"
                                    className="p-1 text-gray-300 hover:text-white"
                                    aria-label="알림 보기"
                                    title="알림"
                                >
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="px-3 py-2">
                                <WalletStatus />
                            </div>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
