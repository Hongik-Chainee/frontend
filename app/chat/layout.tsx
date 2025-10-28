// src/app/chat/layout.tsx
'use client';

import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { ready, authed } = useAuthGuard({ redirectTo: '/login' });

    if (!ready) {
        return (
            <div className="grid min-h-[50vh] place-items-center text-white/80">
                <div className="animate-pulse">인증 확인 중...</div>
            </div>
        );
    }
    if (!authed) return null;

    return <>{children}</>;
}
