const PROXY_BASE_PATH = '/api/chain';

function getContractBase() {
  if (typeof window !== 'undefined') {
    return PROXY_BASE_PATH;
  }
  return (
    process.env.CHAIN_API_BASE ??
    process.env.NEXT_PUBLIC_CHAIN_API_BASE ??
    process.env.NEXT_PUBLIC_API_BASE ??
    ''
  );
}

function buildContractUrl(base: string, path: string) {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function requestContractApi<T>(path: string, init?: RequestInit): Promise<T> {
  const contractBase = getContractBase();
  if (!contractBase) {
    throw new Error('CONTRACT_API_BASE_MISSING');
  }
  const res = await fetch(buildContractUrl(contractBase, path), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CONTRACT_API_FAILED ${res.status} ${text}`);
  }
  const data = (await res.json().catch(() => null)) as T;
  return data;
}

export type CreateContractPayload = {
  employer: string;
  employee: string;
  salary: string | number;
  startDate: number;
  dueDate: number;
};

export async function createChainContract(payload: CreateContractPayload): Promise<any> {
  return requestContractApi<any>('/contract/create', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      salary: String(payload.salary),
    }),
  });
}

export type EndContractPayload = {
  employer: string;
  employee: string;
  contract: string;
  escrow: string;
  amount: string | number;
};

export async function endChainContract(payload: EndContractPayload): Promise<any> {
  return requestContractApi<any>('/contract/end', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      amount: String(payload.amount),
    }),
  });
}

export type ExpireContractPayload = {
  employer: string;
  contract: string;
  escrow: string;
};

export async function expireChainContract(payload: ExpireContractPayload): Promise<any> {
  return requestContractApi<any>('/contract/expire', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loadChainContract(contractAddress: string): Promise<any> {
  const qs = new URLSearchParams({ contract: contractAddress });
  return requestContractApi<any>(`/contract/load?${qs.toString()}`);
}
