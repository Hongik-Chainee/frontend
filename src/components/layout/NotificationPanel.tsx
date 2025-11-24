'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useNotificationPanel } from '@/providers/NotificationPanelProvider';
import type { NotificationItem } from '@/models/notification';
import { fetchNotifications } from '@/services/notificationsApi';

export default function NotificationPanel() {
  const { isOpen, close } = useNotificationPanel();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const canLoadMore = useMemo(() => page + 1 < totalPages, [page, totalPages]);

  const loadPage = useCallback(async (nextPage = 0, mode: 'replace' | 'append' = 'replace') => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    mode === 'append' ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const data = await fetchNotifications(nextPage, 10);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setItems((prev) =>
        mode === 'append' ? [...prev, ...data.notifications] : data.notifications
      );
    } catch (err: any) {
      setError(err?.message ?? '알림을 불러오지 못했어요.');
    } finally {
      isFetchingRef.current = false;
      mode === 'append' ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadPage(0, 'replace');
    }
  }, [isOpen, loadPage]);

  // 알림 타입에 따라 동적으로 링크 생성
  const generateNotificationLink = useCallback((item: NotificationItem): string | null => {
    // 디버깅: 모든 알림 정보 출력
    console.log('=== Notification Debug ===');
    console.log('Type:', item.type);
    console.log('Title:', item.title);
    console.log('Message:', item.message);
    console.log('LinkUrl:', item.linkUrl);
    console.log('========================');

    // 서버에서 linkUrl이 있으면 우선 사용
    if (item.linkUrl) {
      console.log('[generateNotificationLink] Using server linkUrl:', item.linkUrl);
      return item.linkUrl;
    }

    // 알림 타입별 링크 생성
    switch (item.type) {
      case 'JOB_APPLICATION_RECEIVED':
        // 구인 공고 지원 알림 -> 지원자 목록 페이지
        // message에서 jobId 추출 시도 (예: "공고 #123에 지원이 접수되었습니다")
        const jobIdMatch = item.message.match(/#(\d+)/);
        if (jobIdMatch) {
          return `/projects/${jobIdMatch[1]}/applicants`;
        }
        return '/projects';

      case 'JOB_STATUS_UPDATED':
        // 지원 상태 업데이트 알림 -> 해당 공고 페이지
        const statusJobMatch = item.message.match(/#(\d+)/);
        if (statusJobMatch) {
          return `/projects/${statusJobMatch[1]}`;
        }
        return '/projects';

      case 'CONTRACT_REQUEST':
      case 'CONTRACT_SIGNATURE_REQUEST':  // ✅ 서버가 사용하는 실제 타입
        // 계약 요청 알림 → 계약서 페이지 (구직자 역할)
        console.log('[NotificationPanel] CONTRACT_REQUEST/SIGNATURE_REQUEST message:', item.message);
        try {
          // 메시지가 JSON 형식인지 확인 (프론트에서 보낸 경우)
          const data = JSON.parse(item.message);
          console.log('[NotificationPanel] Parsed contract data:', data);
          if (data.type === 'CONTRACT_REQUEST' && data.postId) {
            const params = new URLSearchParams({
              postId: data.postId,
              role: 'applicant',
            });
            if (data.contract) params.set('contract', data.contract);
            if (data.escrow) params.set('escrow', data.escrow);
            params.set('applicantSigned', 'false');
            const link = `/contracts/review?${params.toString()}`;
            console.log('[NotificationPanel] Generated link:', link);
            return link;
          }
        } catch (e) {
          // JSON 파싱 실패 시 기존 로직으로 폴백
          console.log('[NotificationPanel] JSON parse failed, using fallback:', e);
        }

        // 폴백: message에서 공고 제목 추출
        // 예: "'junior solidity engineer' 공고에 대한 계약서 전자 서명을 진행해 주세요."
        console.log('[NotificationPanel] Extracting job title from message...');

        // 임시 해결책: 알림 데이터에 다른 필드가 있는지 확인
        // actorId나 다른 필드에 정보가 있을 수 있음
        console.log('[NotificationPanel] Full notification item:', item);

        // 메시지에서 공고 번호나 ID 추출 시도
        const idMatch = item.message.match(/#(\d+)/);
        if (idMatch) {
          const fallbackLink = `/contracts/review?postId=${idMatch[1]}&role=applicant`;
          console.log('[NotificationPanel] Fallback link with ID:', fallbackLink);
          return fallbackLink;
        }

        // ID가 없으면 일단 기본 페이지로
        console.warn('[NotificationPanel] Cannot extract postId from message, returning null');
        return null;

      case 'PROJECT_INVITE':
        // 프로젝트 초대 알림 -> 프로젝트 상세 페이지
        const projectMatch = item.message.match(/#(\d+)/);
        if (projectMatch) {
          return `/projects/${projectMatch[1]}`;
        }
        return '/projects';

      case 'SYSTEM':
        // 시스템 알림 -> 링크 없음
        return null;

      default:
        // 기본값: 알림 타입에 따라 추측
        if (item.message.includes('계약')) {
          return '/contracts/review';
        }
        if (item.message.includes('프로젝트') || item.message.includes('공고')) {
          return '/projects';
        }
        return null;
    }
  }, []);

  const handleNavigate = useCallback(
    (item: NotificationItem) => {
      const link = generateNotificationLink(item);
      if (!link) return;
      close();
      router.push(link);
    },
    [router, close, generateNotificationLink]
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="pointer-events-auto w-full max-w-sm">
                <div className="flex h-full flex-col">
                  <div className="relative flex items-center justify-between px-4 py-3">
                    <Dialog.Title className="flex items-center gap-2 text-white/90 font-semibold">
                      <BellIcon className="h-5 w-5" />
                      Notifications
                    </Dialog.Title>
                    <button
                      className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10"
                      onClick={close}
                      aria-label="닫기"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mx-4 mb-6 rounded-3xl bg-gradient-to-b from-[#6D66F3] to-[#1E1A6B] p-4 shadow-2xl">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-white/90 font-semibold">알림</h2>
                        <span className="text-xs text-white/70">
                          {items.length}개의 알림
                        </span>
                      </div>
                      <div className="mt-3 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
                        {loading && !items.length ? (
                          <SkeletonList />
                        ) : error ? (
                          <ErrorState message={error} onRetry={() => loadPage(page)} />
                        ) : !items.length ? (
                          <EmptyState />
                        ) : (
                          <>
                            <ul className="space-y-2">
                              {items.map((item) => (
                                <li key={item.id}>
                                  <NotificationCard item={item} onNavigate={handleNavigate} />
                                </li>
                              ))}
                            </ul>
                            {canLoadMore && (
                              <button
                                className="mt-3 w-full rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-60"
                                disabled={loadingMore}
                                onClick={() => loadPage(page + 1, 'append')}
                              >
                                {loadingMore ? '불러오는 중...' : '더 보기'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function NotificationCard({
  item,
  onNavigate,
}: {
  item: NotificationItem;
  onNavigate?: (item: NotificationItem) => void;
}) {
  const clickable = Boolean(onNavigate);

  const handleClick = () => {
    if (!clickable) return;
    onNavigate?.(item);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onNavigate?.(item);
    }
  };

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`w-full rounded-2xl bg-white/10 px-3 py-3 text-white/80 ring-1 ring-white/5 ${clickable ? 'cursor-pointer transition hover:ring-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70' : ''
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-white/80">{item.message}</p>
        </div>
        {!item.read ? (
          <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#71FF9C]" />
        ) : null}
      </div>
      <div className="mt-3 text-right text-[11px] uppercase tracking-wide text-white/50">
        {new Date(item.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <li key={idx} className="rounded-2xl bg-white/10 px-3 py-3 ring-1 ring-white/5">
          <div className="h-4 w-1/2 rounded bg-white/20" />
          <div className="mt-2 h-3 w-full rounded bg-white/10" />
          <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
        </li>
      ))}
    </ul>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl bg-red-500/10 px-4 py-6 text-sm text-red-100 ring-1 ring-red-500/20">
      <p>{message}</p>
      <button
        className="mt-3 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white/5 px-4 py-10 text-center text-sm text-white/70 ring-1 ring-white/10">
      알림이 없습니다.
    </div>
  );
}
