'use client';

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNotificationPanel } from '@/providers/NotificationPanelProvider';
import type { NotificationItem } from '@/models/notification';
import { fetchNotifications } from '@/services/notificationsApi';

export default function NotificationPanel() {
  const { isOpen, close } = useNotificationPanel();
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
                                  <NotificationCard item={item} />
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

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-white/80 ring-1 ring-white/5">
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
