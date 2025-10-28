'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type ChatPanelContextType = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

const ChatPanelContext = createContext<ChatPanelContextType | null>(null);

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);

    const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

    // ✅ 패널 열림 시 body 스크롤 잠금 (렌더 중 부작용 방지: useEffect로)
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = isOpen ? 'hidden' : prev || '';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen]);

    return (
        <ChatPanelContext.Provider value={value}>
            {children}
        </ChatPanelContext.Provider>
    );
}

export function useChatPanel() {
    const ctx = useContext(ChatPanelContext);
    if (!ctx) {
        throw new Error('useChatPanel must be used within <ChatPanelProvider>');
    }
    return ctx;
}
