export type ConversationSummary = {
    id: number;
    partnerName: string;
    partnerProfileImageUrl?: string | null;
    lastMessage?: string | null;
    lastMessageAt?: string | null;
    unreadCount: number;
};