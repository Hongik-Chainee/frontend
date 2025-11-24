import { getAccessToken, isAccessExpired } from "@/services/auth/tokenStorage";
const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function sendContractRequestNotification(
  applicationId: number | string,
  transactionPayload: unknown,
  linkUrl?: string,
  contractData?: {
    postId: string;
    contract?: string;
    escrow?: string;
    jobTitle?: string;
  }
): Promise<void> {
  if (!BASE) {
    throw new Error('API_BASE_MISSING');
  }

  // 1) access token 가져오기
  const accessToken = getAccessToken();
  if (!accessToken || isAccessExpired(30)) {
    // 만료여부까지 보고 싶으면 isAccessExpired 사용
    // 여기에서 바로 로그인 페이지로 보내거나, refresh 로직 호출해도 됨
    throw new Error("NO_VALID_ACCESS_TOKEN");
  }

  const body: Record<string, unknown> = {
    transaction:
      typeof transactionPayload === 'string'
        ? transactionPayload
        : JSON.stringify(transactionPayload),
  };

  // linkUrl 우선 사용, 없으면 contractData로 생성
  if (linkUrl) {
    body.linkUrl = linkUrl;
  } else if (contractData) {
    // linkUrl이 없으면 contractData로 생성
    const params = new URLSearchParams({
      postId: contractData.postId,
      role: 'applicant',
    });
    if (contractData.contract) params.set('contract', contractData.contract);
    if (contractData.escrow) params.set('escrow', contractData.escrow);
    params.set('applicantSigned', 'false');
    body.linkUrl = `/contracts/review?${params.toString()}`;
  }

  // 계약 정보를 메시지에도 포함 (이중 보험)
  if (contractData) {
    body.message = JSON.stringify({
      type: 'CONTRACT_REQUEST',
      ...contractData,
      timestamp: new Date().toISOString(),
    });
  }

  const res = await fetch(
    `${BASE}/api/job/applications/${applicationId}/contract-request`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
      credentials: 'include',
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CONTRACT_NOTIFY_FAILED ${res.status} ${text}`);
  }

  const data = await res.json().catch(() => null);
  if (!data?.success) {
    throw new Error(data?.messageCode ?? 'CONTRACT_NOTIFY_ERROR');
  }
}
