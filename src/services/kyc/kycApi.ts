import { saveTokens } from "@/services/auth/tokenStorage";
import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

/** KYC 요청 응답 타입 */
export interface KycPhoneRequestRes {
  requestId: string;
  sent: boolean;
}

/** KYC 검증 응답 타입 */
export interface KycPhoneVerifyRes {
  kycVerified: boolean;
  nextStep: string; // "DID" | "RETRY" 등
  accessToken?: string;
  accessExp?: number;
  refreshExp?: number;
}

async function readTextSafely(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ""; }
}
async function readJsonSafely<T = any>(res: Response): Promise<T | {}> {
  try { return (await res.json()) as T; } catch { return {}; }
}

/** 휴대폰 본인인증 코드 요청 */
export async function kycPhoneRequest(phone: string): Promise<KycPhoneRequestRes> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const res = await fetch(`${BASE}/api/kyc/phone/request`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
  });

  const text = await readTextSafely(res);
  if (!res.ok) {
    console.error("[kycPhoneRequest] status:", res.status, "body:", text);
    throw new Error(`KYC_REQ_FAILED ${res.status} ${text}`);
  }
  try {
    return JSON.parse(text) as KycPhoneRequestRes;
  } catch {
    return { requestId: "", sent: false };
  }
}

/** 휴대폰 본인인증 코드 검증 + 이름 저장 */
export async function kycPhoneVerify(
  requestId: string,
  code: string,
  name: string
): Promise<KycPhoneVerifyRes> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NO_TOKEN");

  const trimmedName = (name ?? "").trim();
  if (!trimmedName) throw new Error("NAME_REQUIRED");

  const res = await fetch(`${BASE}/api/kyc/phone/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ requestId, code, name: trimmedName }),
  });

  const data = (await readJsonSafely<KycPhoneVerifyRes>(res)) as KycPhoneVerifyRes;
  if (!res.ok) throw new Error(`KYC_VERIFY_FAILED ${res.status} ${JSON.stringify(data)}`);

  if (data?.kycVerified && data?.accessToken && data?.accessExp) {
    saveTokens(data.accessToken, Number(data.accessExp));
  }
  return data;
}
