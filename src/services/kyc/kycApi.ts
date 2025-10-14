import { saveTokens } from "@/services/auth/tokenStorage";
import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function kycPhoneRequest(phone: string) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${BASE}/api/kyc/phone/request`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("[kycPhoneRequest] status:", res.status, "body:", text);
    throw new Error(`KYC_REQ_FAILED ${res.status} ${text}`);
  }

  try { return JSON.parse(text); } catch { return {}; }
}

export async function kycPhoneVerify(requestId: string, code: string) {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${BASE}/api/kyc/phone/verify`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ requestId, code }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`KYC_VERIFY_FAILED ${res.status} ${JSON.stringify(data)}`);
  }

  // 성공 시 accessToken/exp 갱신 내려오면 저장
  if (data?.kycVerified && data?.accessToken && data?.accessExp) {
    saveTokens(data.accessToken, Number(data.accessExp));
  }

  return data as {
    kycVerified: boolean;
    nextStep: string;
    accessToken?: string;
    accessExp?: number;
    refreshExp?: number;
  };
}
