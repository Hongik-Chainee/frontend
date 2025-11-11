// src/services/did/didChainApi.ts
import { Connection, Transaction } from "@solana/web3.js";

const CHAIN_BASE = process.env.NEXT_PUBLIC_CHAIN_API_BASE ?? "http://localhost:8080";

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
