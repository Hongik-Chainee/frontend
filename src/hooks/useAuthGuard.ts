// src/hooks/useAuthGuard.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { refreshOnce, getValidAccessToken, fetchMe } from '@/services/auth/authApi';
import { clearTokens } from '@/services/auth/tokenStorage';

type GuardOptions = {
    redirectTo?: string;      // 기본 /login
    requireKycDid?: boolean;  // 필요 시 KYC/DID 페이지로 유도
};

export function useAuthGuard(opts: GuardOptions = {}) {
    const { redirectTo = '/login', requireKycDid = false } = opts;
    const [ready, setReady] = useState(false);
    const [authed, setAuthed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        (async () => {
            // 1) access 확인(만료면 내부에서 refresh 시도)
            let token = await getValidAccessToken();
            if (!token) {
                const ok = await refreshOnce();
                if (!ok) {
                    clearTokens();
                    router.replace(redirectTo);
                    return;
                }
                token = await getValidAccessToken();
                if (!token) {
                    router.replace(redirectTo);
                    return;
                }
            }

            // 2) (옵션) KYC/DID 요구 시 분기
            if (requireKycDid) {
                const me = await fetchMe(); // {kyc, did}
                if (!me) {
                    router.replace(redirectTo);
                    return;
                }
                if (!me.kyc) {
                    router.replace('/kyc');
                    return;
                }
                if (!me.did) {
                    router.replace('/did');
                    return;
                }
            }

            setAuthed(true);
            setReady(true);
        })();
    }, [redirectTo, requireKycDid, router]);

    return { ready, authed };
}
