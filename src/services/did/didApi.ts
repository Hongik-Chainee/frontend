// src/services/did/didApi.ts
import { saveTokens } from "@/services/auth/tokenStorage";
import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function didGetNonce() {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const r = await fetch(`${BASE}/api/did/nonce`, {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });

  const txt = await r.text().catch(() => "");
  if (!r.ok) throw new Error(`NONCE_FAIL ${r.status} ${txt}`);
  return JSON.parse(txt) as { nonce: string; expiresInSec: number };
}

export async function didVerify(did: string, addressBase58: string, signatureBase58: string) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const r = await fetch(`${BASE}/api/did/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ did, address: addressBase58, signatureBase58 }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.messageCode || `VERIFY_FAIL ${r.status}`);

  if (data?.accessToken && data?.accessExp) {
    saveTokens(data.accessToken, Number(data.accessExp));
  }

  return data as { success: true; accessToken: string; accessExp: number; refreshExp: number };
}

type DidMarkResponse = {
  success: boolean;
  didVerified: boolean;
  did?: string;
  didVerifiedAt?: string;
};

// 최종 마킹: didVerified 상태 업데이트
export async function didMarkVerified(verified: boolean, did?: string) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  if (verified && !did) {
    throw new Error("DID_REQUIRED");
  }

  const r = await fetch(`${BASE}/api/did/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(
      verified ? { verified: true, did } : { verified: false }
    ),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.messageCode || `MARK_VERIFY_FAIL ${r.status}`);

  if (data?.accessToken && data?.accessExp) {
    saveTokens(data.accessToken, Number(data.accessExp));
  }

  return data as DidMarkResponse;
}
