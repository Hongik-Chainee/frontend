// src/viewModels/didStartViewModel.ts
import { didMarkVerified } from "@/services/did/didApi";
import {
  chainDidInitPrepare,
  signAndSendWithPhantom,
} from "@/services/did/didChainApi";
import {
  DID_CHALLENGE_PHASE_MESSAGES,
  DidChallengePhaseHandler,
  executeDidChallengeFlow,
} from "@/services/did/didChallengeFlow";

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

  // 체인 DID 상태 확인 → 없음이면 init/vm → challenge issue/sign/verify
  async connectAndVerify(
    onPhaseChange?: DidChallengePhaseHandler
  ): Promise<{ ok: boolean; error?: string }> {
    try {
      const provider = (window as any).solana as PhantomProvider | undefined;
      if (!provider?.isPhantom) {
        return { ok: false, error: "PHANTOM_NOT_FOUND" };
      }

      await provider.connect();
      const address = provider.publicKey?.toString();
      if (!address) return { ok: false, error: "WALLET_NO_ADDRESS" };

      if (!provider.signMessage) {
        return { ok: false, error: "SIGN_MESSAGE_NOT_SUPPORTED" };
      }

      const domain =
        process.env.NEXT_PUBLIC_CHAIN_DOMAIN ||
        (typeof window !== "undefined" ? window.location.host : "localhost");

      await executeDidChallengeFlow({
        holder: address,
        domain,
        signMessage: async (message) => {
          const res = await provider.signMessage!(message, "utf8");
          if (res && "signature" in res && res.signature) {
            return res.signature;
          }
          throw new Error("SIGN_MESSAGE_FAILED");
        },
        onPhaseChange,
      });

      return { ok: true };
    } catch (e: any) {
      const msg = e?.message || DID_CHALLENGE_PHASE_MESSAGES.error;
      return { ok: false, error: msg };
    }
  }

  // 2) 체인 DID init: 서버가 트랜잭션 준비 → 프론트가 서명·전송(확정 대기)
  async issueDidInitOnChain(): Promise<{ ok: boolean; error?: string; signature?: string; did?: string }> {
    try {
      const provider = (window as any).solana as PhantomProvider | undefined;
      if (!provider?.isPhantom) return { ok: false, error: "PHANTOM_NOT_FOUND" };

      await provider.connect();
      const wallet = provider.publicKey?.toString();
      if (!wallet) return { ok: false, error: "WALLET_NO_ADDRESS" };
      const did = `did:sol:${wallet}`;

      // 1) 서버에서 서명 전 트랜잭션 수령
      const { txB64, rpc } = await chainDidInitPrepare(wallet);

      // 2) Phantom으로 서명·전송 (confirmed까지 대기)
      const signature = await signAndSendWithPhantom(provider, txB64, rpc);

      return { ok: true, signature, did };
    } catch (e: any) {
      return { ok: false, error: e?.message || "CHAIN_INIT_ERROR" };
    }
  }

  // 3) 백엔드 상태 마킹: didVerified = true
  async markDidVerified(did: string): Promise<{ ok: boolean; error?: string }> {
    try {
      await didMarkVerified(true, did);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || "MARK_FAIL" };
    }
  }
}
