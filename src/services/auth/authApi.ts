import { saveTokens, getAccessTokenRaw, isAccessExpired, clearTokens } from "./tokenStorage";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function refreshOnce(): Promise<boolean> {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => null); // { accessToken, accessExp, ... }
  if (!data?.accessToken || !data?.accessExp) return false;
  saveTokens(data.accessToken, Number(data.accessExp));
  return true;
}

/**
 * 항상 유효한 액세스 토큰을 반환 (만료 시 refresh 시도)
 * 실패 시 null
 */
export async function getValidAccessToken(): Promise<string | null> {
  const raw = getAccessTokenRaw();
  if (!raw) return null;

  if (!isAccessExpired(10)) { // 10초 그레이스
    return raw;
  }

  // 만료 → refresh 시도
  const ok = await refreshOnce();
  if (!ok) {
    clearTokens();
    return null;
  }
  return getAccessTokenRaw();
}

export async function fetchMe(): Promise<{ kyc: boolean; did: boolean } | null> {
  const token = await getValidAccessToken();
  if (!token) return null;

  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) return null;

  const data = await res.json().catch(() => ({}));
  const kyc = data?.kyc ?? data?.status?.kyc ?? false;
  const did = data?.did ?? data?.status?.did ?? false;
  return { kyc, did };
}

type ExchangeResponse = {
  accessToken: string;
  accessExp: number;
  nextStep?: "KYC" | "DID" | "HOME";
};

export async function exchangeLoginCode(loginCode: string): Promise<ExchangeResponse> {
  const res = await fetch(`${BASE}/api/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ loginCode }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LOGIN_CODE_EXCHANGE_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as ExchangeResponse;
  if (!data?.accessToken || !data?.accessExp) {
    throw new Error("INVALID_EXCHANGE_RESPONSE");
  }

  saveTokens(data.accessToken, Number(data.accessExp));
  return data;
}
