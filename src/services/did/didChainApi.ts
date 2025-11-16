// src/services/did/didChainApi.ts
import { Connection, Transaction } from "@solana/web3.js";

const CHAIN_BASE = process.env.NEXT_PUBLIC_CHAIN_API_BASE ?? "http://localhost:8080";

type DidStatusResponse = {
  hasDid: boolean;
  did?: string;
  document?: unknown;
  reason?: string;
};

export type ChallengeIssueResponse = {
  holder: string;
  domain: string;
  nonce: string;
  expiresInSec?: number;
  challenge?: Record<string, unknown>;
};

// 서버에서 '서명 전 트랜잭션' 받기
export async function chainDidInitPrepare(walletBase58: string) {
  const r = await fetch(`${CHAIN_BASE}/api/did/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet: walletBase58 })
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok || !data?.txB64) {
    throw new Error(data?.reason || `CHAIN_INIT_PREPARE_FAIL ${r.status}`);
  }

  return data as {
    ok: true;
    mode: "prepare";
    txB64: string;
    rpc?: string;
    cluster: string;
    feePayer: string;
  };
}

const toUrl = (path: string) =>
  `${CHAIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;

async function parseJson<T>(res: Response, fallbackError: string): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      (typeof data.reason === "string" && data.reason) ||
        (typeof data.message === "string" && data.message) ||
        `${fallbackError} ${res.status}`
    );
  }
  return data as T;
}

export async function chainDidStatus(holder: string): Promise<DidStatusResponse> {
  const url = `${toUrl("/did/status")}?holder=${encodeURIComponent(holder)}`;
  const res = await fetch(url, { method: "GET" });
  return parseJson<DidStatusResponse>(res, "CHAIN_DID_STATUS_FAIL");
}

export async function chainDidInit(holder: string) {
  const res = await fetch(toUrl("/did/init"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holder }),
  });
  return parseJson(res, "CHAIN_DID_INIT_FAIL");
}

export async function chainDidAddVm(holder: string) {
  const res = await fetch(toUrl("/did/vm/add"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holder }),
  });
  return parseJson(res, "CHAIN_DID_VM_ADD_FAIL");
}

const debugLog = (...args: any[]) => {
  const flag = process.env.NEXT_PUBLIC_DEBUG_DID_FLOW;
  const enabled =
    flag === "1" ||
    flag === "true" ||
    (typeof window !== "undefined" &&
      ["1", "true"].includes(
        (window.localStorage?.getItem("debugDidFlow") ?? "").toLowerCase()
      ));
  if (enabled) {
    console.debug("[chainDidApi]", ...args);
  }
};

const toStringFromBuffer = (value: any): string | undefined => {
  if (
    value &&
    typeof value === "object" &&
    value.type === "Buffer" &&
    Array.isArray(value.data)
  ) {
    try {
      return Buffer.from(value.data).toString("utf8");
    } catch {
      try {
        return Buffer.from(value.data).toString("base64");
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
};

const normalizedNonceValue = (value: any): string | undefined => {
  if (typeof value === "string" && value) return value;
  return toStringFromBuffer(value);
};

const extractNonce = (payload: any): string | undefined => {
  if (!payload || typeof payload !== "object") return undefined;

  const visited = new WeakSet<object>();

  const scan = (value: any, depth: number): string | undefined => {
    if (!value || typeof value !== "object") return undefined;
    if (visited.has(value)) return undefined;
    visited.add(value);

    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("nonce")) {
        const normalized = normalizedNonceValue(val);
        if (normalized) return normalized;
      }
    }

    if (depth > 5) return undefined;

    for (const val of Object.values(value)) {
      if (val && typeof val === "object") {
        const nested = scan(val, depth + 1);
        if (nested) return nested;
      }
    }
    return undefined;
  };

  return scan(payload, 0);
};

export async function chainChallengeIssue(holder: string, domain: string) {
  const res = await fetch(toUrl("/challenge/issue"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holder, domain }),
  });
  const data = await parseJson<any>(res, "CHAIN_CHALLENGE_ISSUE_FAIL");
  debugLog("challenge/issue response", data);
  const normalizedNonce = extractNonce(data);
  if (!normalizedNonce) {
    console.warn("[chainDidApi] challenge/issue missing nonce", data);
    throw new Error("CHAIN_CHALLENGE_NO_NONCE");
  }
  return {
    ...(typeof data === "object" ? data : {}),
    nonce: normalizedNonce,
  } as ChallengeIssueResponse;
}

export async function chainChallengeVerify(params: {
  holder: string;
  domain: string;
  nonce: string;
  vc: string;
  vp: string;
}) {
  const res = await fetch(toUrl("/challenge/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return parseJson(res, "CHAIN_CHALLENGE_VERIFY_FAIL");
}

// 클라이언트에서 서명/전송 수행
export async function signAndSendWithPhantom(
  provider: any,
  txB64: string,
  rpc?: string
) {
  const tx = Transaction.from(Buffer.from(txB64, "base64"));

  // 최신 Phantom은 signAndSendTransaction 지원
  if (typeof provider?.signAndSendTransaction === "function") {
    const { signature } = await provider.signAndSendTransaction(tx);
    const conn = new Connection(rpc || "https://api.devnet.solana.com", "confirmed");
    await conn.confirmTransaction(signature, "confirmed");
    return signature;
  }

  if (!provider?.signTransaction) {
    throw new Error("SIGN_NOT_SUPPORTED");
  }
  const signed = await provider.signTransaction(tx);
  const conn = new Connection(rpc || "https://api.devnet.solana.com", "confirmed");
  const sig = await conn.sendRawTransaction(signed.serialize());
  await conn.confirmTransaction(sig, "confirmed");
  return sig;
}
