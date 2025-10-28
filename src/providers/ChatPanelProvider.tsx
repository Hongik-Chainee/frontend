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
    /** 사이드 리스트 패널 */
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;

    /** 플로팅 채팅창 */
    roomId: string | null;
    isRoomOpen: boolean;
    openRoom: (id: string) => void;
    closeRoom: () => void;
};

const ChatPanelContext = createContext<ChatPanelContextType | null>(null);

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
    // 리스트 패널
    const [isOpen, setIsOpen] = useState(false);
    // 플로팅 채팅창
    const [roomId, setRoomId] = useState<string | null>(null);
    const isRoomOpen = !!roomId;

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(v => !v), []);

    const openRoom = useCallback((id: string) => {
        setRoomId(id);
        setIsOpen(false); // 리스트는 닫고
    }, []);
    const closeRoom = useCallback(() => setRoomId(null), []);

    const value = useMemo(
        () => ({ isOpen, open, close, toggle, roomId, isRoomOpen, openRoom, closeRoom }),
        [isOpen, open, close, toggle, roomId, isRoomOpen, openRoom, closeRoom]
    );

    // 패널/창 열림 시 body 스크롤 잠금
    useEffect(() => {
        const prev = document.body.style.overflow;
        const anyOpen = isOpen || isRoomOpen;
        document.body.style.overflow = anyOpen ? 'hidden' : prev || '';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isOpen, isRoomOpen]);

    return (
        <ChatPanelContext.Provider value={value}>
            {children}
        </ChatPanelContext.Provider>
    );
}

export function useChatPanel() {
    const ctx = useContext(ChatPanelContext);
    if (!ctx) throw new Error('useChatPanel must be used within <ChatPanelProvider>');
    return ctx;
}
