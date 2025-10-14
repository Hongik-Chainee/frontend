'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveTokens } from '@/services/auth/tokenStorage';
import { fetchMe } from '@/services/auth/authApi';

// base64url → JSON
function base64UrlToJson(b64url: string) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const jsonStr = atob(b64);
  return JSON.parse(jsonStr);
}

// #해시 파라미터 파싱
function parseHash(hash: string) {
  const h = hash.startsWith('#') ? hash.slice(1) : hash;
  const p = new URLSearchParams(h);
  const n = (k: string) => (p.get(k) ? Number(p.get(k)) : undefined);
  return {
    accessToken: p.get('accessToken') ?? undefined,
    accessExp: n('accessExp'),
    refreshExp: n('refreshExp'),
    nextStep: p.get('nextStep') ?? undefined, // "KYC" | "DID" | undefined
    registered: p.get('registered') === 'true',
    email: p.get('email') ?? undefined,
  };
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('로그인 처리 중…');

  useEffect(() => {
    (async () => {
      try {
        const { accessToken, accessExp: expFromHash, nextStep } = parseHash(window.location.hash);
        if (!accessToken) {
          setMsg('토큰이 없어 로그인에 실패했습니다.');
          return;
        }

        // exp가 없으면 JWT payload에서 exp 추출
        let accessExp = expFromHash;
        if (!accessExp) {
          const parts = accessToken.split('.');
          if (parts.length < 2) {
            setMsg('토큰 형식이 올바르지 않습니다.');
            return;
          }
          const payload = base64UrlToJson(parts[1]);
          accessExp = Number(payload?.exp || 0);
        }
        if (!accessExp || Number.isNaN(accessExp)) {
          setMsg('토큰 만료 시간이 유효하지 않습니다.');
          return;
        }

        // 1) 토큰 저장
        saveTokens(accessToken, accessExp);

        // 2) URL에서 해시 제거(토큰 흔적 제거)
        window.history.replaceState(null, '', '/auth/callback');

        // 3) 라우팅: nextStep이 우선
        setMsg('인증 완료. 이동합니다…');
        if (nextStep === 'KYC') {
          router.replace('/onboarding/personal');
          return;
        }
        if (nextStep === 'DID') {
          router.replace('/onboarding/did');
          return;
        }

        // 4) nextStep이 없거나 알 수 없을 때 서버 상태로 보정
        const me = await fetchMe(); // { kyc, did } | null
        if (!me) {
          router.replace('/dashboard'); // 보수적 기본
          return;
        }
        if (!me.kyc) {
          router.replace('/onboarding/personal');
        } else if (!me.did) {
          router.replace('/onboarding/did');
        } else {
          router.replace('/dashboard');
        }
      } catch (e) {
        console.error('[auth/callback] error:', e);
        setMsg('로그인 처리 중 오류가 발생했습니다.');
      }
    })();
  }, [router]);

  return (
      <main className="min-h-screen grid place-items-center bg-secondary text-white">
        <div className="p-6 rounded-xl bg-secondary-dark/90 shadow-2xl">{msg}</div>
      </main>
  );
}
