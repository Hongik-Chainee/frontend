import {
  chainChallengeIssue,
  chainChallengeVerify,
  chainDidAddVm,
  chainDidInit,
  chainDidStatus,
} from "./didChainApi";
import { buildSignedVcVp } from "./didCredentialSigner";

export type DidChallengePhase =
  | "idle"
  | "checking"
  | "initializing"
  | "challenge"
  | "signing"
  | "verifying"
  | "success"
  | "error";

export type DidChallengePhaseDetails = {
  message?: string;
  nonce?: string;
};

export type DidChallengePhaseHandler = (
  phase: DidChallengePhase,
  details?: DidChallengePhaseDetails
) => void;

export const DID_CHALLENGE_PHASE_MESSAGES: Record<DidChallengePhase, string> = {
  idle: "대기 중…",
  checking: "체인 DID 상태 확인 중…",
  initializing: "DID 초기화 중…",
  challenge: "Challenge nonce 발급 중…",
  signing: "VC/VP 서명 중…",
  verifying: "Challenge 응답 검증 중…",
  success: "검증이 완료되었습니다.",
  error: "오류 발생",
};

type SignMessageFn = (message: Uint8Array) => Promise<Uint8Array>;

const getDefaultDomain = () =>
  typeof window !== "undefined" ? window.location.host : "localhost";

export async function executeDidChallengeFlow(params: {
  holder: string;
  domain?: string;
  signMessage: SignMessageFn;
  onPhaseChange?: DidChallengePhaseHandler;
}) {
  const { holder, domain, signMessage, onPhaseChange } = params;
  const resolvedDomain = domain || getDefaultDomain();

  const emit = (phase: DidChallengePhase, details?: DidChallengePhaseDetails) =>
    onPhaseChange?.(phase, details);

  try {
    emit("checking", { message: DID_CHALLENGE_PHASE_MESSAGES.checking });
    const status = await chainDidStatus(holder);

    if (!status.hasDid) {
      emit("initializing", {
        message: "DID가 없어 초기화 중입니다…",
      });
      await chainDidInit(holder);
      await chainDidAddVm(holder);
    }

    emit("challenge", {
      message: DID_CHALLENGE_PHASE_MESSAGES.challenge,
    });
    const challenge = await chainChallengeIssue(holder, resolvedDomain);
    const nonce = challenge?.nonce;
    if (!nonce) throw new Error("CHALLENGE_NONCE_MISSING");

    emit("signing", {
      message: DID_CHALLENGE_PHASE_MESSAGES.signing,
      nonce,
    });
    const { vc, vp } = await buildSignedVcVp({
      holder,
      domain: challenge.domain ?? resolvedDomain,
      nonce,
      challengePayload: challenge.challenge,
      signMessage,
    });

    emit("verifying", {
      message: DID_CHALLENGE_PHASE_MESSAGES.verifying,
      nonce,
    });
    await chainChallengeVerify({
      holder,
      domain: challenge.domain ?? resolvedDomain,
      nonce,
      vc,
      vp,
    });

    emit("success", {
      message: DID_CHALLENGE_PHASE_MESSAGES.success,
      nonce,
    });

    return { nonce };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN_CHAIN_ERROR";
    emit("error", { message });
    throw error;
  }
}
