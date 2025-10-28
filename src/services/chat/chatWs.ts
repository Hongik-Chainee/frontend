// src/services/chat/chatWs.ts
'use client';

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { getValidAccessToken } from '@/services/auth/authApi';

function toWsUrl(httpBase: string) {
    // https://chainee.store -> wss://chainee.store
    // http://localhost:8080 -> ws://localhost:8080
    return httpBase.replace(/^http/, 'ws');
}

const BASE = process.env.NEXT_PUBLIC_API_BASE!;
const WS_URL = `${toWsUrl(BASE)}/ws`;

export class ChatWsClient {
    private client: Client;

    constructor() {
        this.client = new Client({
            brokerURL: WS_URL, // native ws
            reconnectDelay: 3000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            // 쿠키가 필요 없다면 webSocketFactory 생략 가능(브라우저 기본 WS 사용)
            onStompError: (f) => console.error('[STOMP] frame error', f),
            onWebSocketError: (e) => console.error('[STOMP] ws error', e),
        });

        // CONNECT 직전 JWT 헤더 주입
        this.client.beforeConnect = async () => {
            const token = await getValidAccessToken();
            if (!token) throw new Error('NO_TOKEN');
            this.client.connectHeaders = {
                Authorization: `Bearer ${token}`,
            };
        };
    }

    async activate() {
        if (this.client.active) return;
        this.client.activate();
        await new Promise<void>((resolve) => {
            const id = setInterval(() => {
                if (this.client.connected) {
                    clearInterval(id);
                    resolve();
                }
            }, 50);
        });
    }

    deactivate() {
        if (this.client.active) this.client.deactivate();
    }

    async subscribeConversation(
        conversationId: number,
        onMessage: (payload: any) => void
    ): Promise<StompSubscription> {
        await this.activate();
        return this.client.subscribe(
            `/topic/conversations/${conversationId}`,
            (msg: IMessage) => {
                try {
                    onMessage(JSON.parse(msg.body));
                } catch {
                    console.warn('[STOMP] invalid json', msg.body);
                }
            }
        );
    }

    async send(conversationId: number, content: string, attachmentUrl?: string) {
        await this.activate();
        this.client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({ conversationId, content, attachmentUrl }),
        });
    }
}
