// src/services/chat/chatApi.ts
import { getValidAccessToken } from "@/services/auth/authApi";
import {ConversationSummary} from "@/models/chat";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchConversations(): Promise<ConversationSummary[]> {
    const token = await getValidAccessToken();
    if (!token) {
        // 토큰 없으면 빈 리스트 반환(패널에선 로그인 유도/리다이렉트 처리 가능)
        return [];
    }

    const res = await fetch(`${BASE}/api/chat/conversations`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        // 401 등 에러는 빈 배열로 처리(패널에서 빈 상태 렌더)
        return [];
    }
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
}
