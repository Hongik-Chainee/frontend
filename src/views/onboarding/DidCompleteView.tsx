'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DidCompleteViewModel } from '@/viewModels/didCompleteViewModel';

export function DidCompleteView() {
  const vm = useMemo(() => new DidCompleteViewModel(), []);
  const router = useRouter();

  // 기존 DidStartView에서 쓰던 톤/클래스와 최대한 일관 유지
  return (
    <div className="min-h-screen w-full bg-secondary text-white grid place-items-center">
      <div className="w-full max-w-2xl mx-auto px-6 text-center">
        {/* 타이틀 */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide">Chainee</h1>

        {/* 본문 */}
        <div className="mt-16 md:mt-20">
          <p className="text-lg md:text-xl font-semibold">{vm.getTitle()}</p>
          <p className="mt-2 text-sm md:text-base text-white/80">{vm.getSubtitle()}</p>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <button
            onClick={() => router.push('/')}
            className="w-full md:w-auto rounded-2xl bg-primary hover:opacity-90 transition
                       focus:outline-none focus:ring-2 focus:ring-white/40
                       px-6 py-4 text-base font-semibold shadow-2xl"
            aria-label="홈 화면으로 돌아가기"
          >
            홈 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
