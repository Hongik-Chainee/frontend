// CSR 전용 토큰 저장 유틸

const ACCESS_KEY = "accessToken";
const ACCESS_EXP_KEY = "accessExp"; // epoch seconds (UNIX)

export function saveTokens(accessToken: string, accessExpSec: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(ACCESS_EXP_KEY, String(accessExpSec));
}

export function getAccessTokenRaw(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

// ✅ 호환용 shim (기존 코드가 getAccessToken을 임포트해도 동작)
export function getAccessToken(): string | null {
  return getAccessTokenRaw();
}

export function getAccessExp(): number | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(ACCESS_EXP_KEY);
  return v ? Number(v) : null;
}

export function isAccessExpired(graceSeconds = 0): boolean {
  const exp = getAccessExp();
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + graceSeconds;
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(ACCESS_EXP_KEY);
}
