'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type NotificationPanelContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const NotificationPanelContext = createContext<NotificationPanelContextType | null>(null);

export function NotificationPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isOpen ? 'hidden' : prev || '';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <NotificationPanelContext.Provider value={value}>
      {children}
    </NotificationPanelContext.Provider>
  );
}

export function useNotificationPanel() {
  const ctx = useContext(NotificationPanelContext);
  if (!ctx) throw new Error('useNotificationPanel must be used within <NotificationPanelProvider>');
  return ctx;
}
