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

  // 백엔드가 새 accessToken/exp 내려주면 저장
  if (data?.accessToken && data?.accessExp) {
    saveTokens(data.accessToken, Number(data.accessExp));
  }

  return data as { success: true; accessToken: string; accessExp: number; refreshExp: number };
}
