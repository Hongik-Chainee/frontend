// src/viewModels/didStartViewModel.ts
import bs58 from "bs58";
import { didGetNonce, didVerify, didMarkVerified } from "@/services/did/didApi";
import { chainDidInitPrepare, signAndSendWithPhantom } from "@/services/did/didChainApi";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect(): Promise<void>;
  signMessage?(message: Uint8Array, displayEncoding?: "utf8" | "hex"): Promise<{ signature: Uint8Array }>;
  signTransaction?(tx: any): Promise<any>;
  signAndSendTransaction?(tx: any): Promise<{ signature: string }>;
};

export class DidStartViewModel {
  isInstalled(): boolean {
    if (typeof window === "undefined") return false;
    const p = (window as any).solana as PhantomProvider | undefined;
    return !!p?.isPhantom;
  }

  // 1) 서버(인증 백엔드)와의 nonce 서명 검증
  async connectAndVerify(): Promise<{ ok: boolean; error?: string }> {
    try {
      const provider = (window as any).solana as PhantomProvider | undefined;
      if (!provider?.isPhantom) return { ok: false, error: "PHANTOM_NOT_FOUND" };

      const { nonce } = await didGetNonce();

      await provider.connect();
      const address = provider.publicKey?.toString();
      if (!address) return { ok: false, error: "WALLET_NO_ADDRESS" };

      const msg = new TextEncoder().encode(nonce);
      if (!provider.signMessage) return { ok: false, error: "SIGN_MESSAGE_NOT_SUPPORTED" };
      const { signature } = await provider.signMessage(msg, "utf8");
      const signatureBase58 = bs58.encode(signature);

      const did = `did:sol:${address}`;
      await didVerify(did, address, signatureBase58);

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "UNKNOWN_ERROR" };
    }
  }

  // 2) 체인 DID init: 서버가 트랜잭션 준비 → 프론트가 서명·전송(확정 대기)
  async issueDidInitOnChain(): Promise<{ ok: boolean; error?: string; signature?: string }> {
    try {
      const provider = (window as any).solana as PhantomProvider | undefined;
      if (!provider?.isPhantom) return { ok: false, error: "PHANTOM_NOT_FOUND" };

      await provider.connect();
      const wallet = provider.publicKey?.toString();
      if (!wallet) return { ok: false, error: "WALLET_NO_ADDRESS" };

      // 1) 서버에서 서명 전 트랜잭션 수령
      const { txB64, rpc } = await chainDidInitPrepare(wallet);

      // 2) Phantom으로 서명·전송 (confirmed까지 대기)
      const signature = await signAndSendWithPhantom(provider, txB64, rpc);

      return { ok: true, signature };
    } catch (e: any) {
      return { ok: false, error: e?.message || "CHAIN_INIT_ERROR" };
    }
  }

  // 3) 백엔드 상태 마킹: didVerified = true
  async markDidVerified(): Promise<{ ok: boolean; error?: string }> {
    try {
      await didMarkVerified(true);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "MARK_FAIL" };
    }
  }
}
