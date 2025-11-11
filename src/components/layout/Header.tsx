'use client';

import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, BellIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

// ✅ Solana
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// ✅ Chat panel
import { useChatPanel } from '@/providers/ChatPanelProvider';
import { useNotificationPanel } from '@/providers/NotificationPanelProvider';

// ✅ Auth 토큰 읽기/삭제 유틸 (이미 있는 것 사용)
import { getAccessTokenRaw, clearTokens } from '@/services/auth/tokenStorage';

const BASE = process.env.NEXT_PUBLIC_API_BASE!;
const navigation = [
    { name: 'Project', href: '/projects' },
    { name: 'Talent', href: '/talent' },
    { name: 'Profile', href: '/profile' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

/** 지갑 영역 */
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
            <button onClick={copy} className="text-xs opacity-80 hover:opacity-100">복사</button>
            <span className="opacity-30">|</span>
            <button onClick={() => disconnect()} className="text-xs opacity-80 hover:opacity-100">해제</button>
        </div>
    );
}

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { open: openChat } = useChatPanel();
    const { open: openNotifications } = useNotificationPanel();

    // 👇 헤더에서 즉시 반영될 인증 상태
    const [isAuthed, setIsAuthed] = useState<boolean>(!!getAccessTokenRaw());

    const refreshAuthState = useCallback(() => {
        setIsAuthed(!!getAccessTokenRaw());
    }, []);

    // 경로/검색어 변화 시 토큰 재확인
    useEffect(() => {
        refreshAuthState();
    }, [pathname, searchParams, refreshAuthState]);

    // 탭 포커스 돌아올 때도 재확인 (로그인 플로우 후 복귀 케이스)
    useEffect(() => {
        const onFocus = () => refreshAuthState();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refreshAuthState]);

    // 혹시 다른 코드가 커스텀 이벤트를 쏠 경우 대비 (선택적)
    useEffect(() => {
        const onAuthChanged = () => refreshAuthState();
        window.addEventListener('auth:changed', onAuthChanged as EventListener);
        return () => window.removeEventListener('auth:changed', onAuthChanged as EventListener);
    }, [refreshAuthState]);

    const handleSignIn = () => {
        // 로그인 진입점은 /auth/signin (요청사항 반영)
        router.push('/auth/signin');
    };

    const handleLogout = async () => {
        // 서버에 로그아웃 엔드포인트가 있다면 먼저 호출 (없어도 무방)
        try {
            await fetch(`${BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // 서버에 엔드포인트 없을 수 있음 → 무시
        } finally {
            clearTokens();                 // 로컬 토큰 제거
            setIsAuthed(false);            // 즉시 UI 반영
            router.refresh?.();            // (Next 13+) 데이터 재검증
            router.push('/auth/signin');   // 로그인 페이지로 이동
        }
    };

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
                                <button
                                    type="button"
                                    className="p-1 text-gray-300 hover:text-white"
                                    onClick={() => openChat()}
                                >
                                    <span className="sr-only">채팅 보기</span>
                                    <ChatBubbleLeftIcon className="h-6 w-6" />
                                </button>

                                {/* 알림 버튼 */}
                                <button
                                    type="button"
                                    className="ml-2 p-1 text-gray-300 hover:text-white"
                                    onClick={() => openNotifications()}
                                >
                                    <span className="sr-only">알림 보기</span>
                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                </button>

                                {/* 지갑 */}
                                <WalletStatus />

                                {/* 🔐 인증 버튼: Sign in ↔ Logout 토글 */}
                                {isAuthed ? (
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                                    >
                                        Log out
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSignIn}
                                        className="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-black hover:bg-white"
                                    >
                                        Sign in
                                    </button>
                                )}
                            </div>

                            {/* 모바일 메뉴 버튼 */}
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

                    {/* 모바일 드롭다운 */}
                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as="a"
                                    href={item.href}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}

                            <div className="px-3 py-2 flex items-center gap-3">
                                <WalletStatus />
                                {isAuthed ? (
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                                    >
                                        Log out
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSignIn}
                                        className="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-black hover:bg-white"
                                    >
                                        Sign in
                                    </button>
                                )}
                            </div>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
