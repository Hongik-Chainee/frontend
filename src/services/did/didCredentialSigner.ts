import bs58 from "bs58";

type SignMessageFn = (message: Uint8Array) => Promise<Uint8Array>;

export type VcVpBuildParams = {
  holder: string;
  domain: string;
  nonce: string;
  challengePayload?: Record<string, unknown>;
  signMessage: SignMessageFn;
};

const encoder = new TextEncoder();

async function signPayload(payload: unknown, signMessage: SignMessageFn) {
  const encoded =
    typeof payload === "string"
      ? encoder.encode(payload)
      : encoder.encode(JSON.stringify(payload));
  const signature = await signMessage(encoded);
  return bs58.encode(signature);
}

export async function buildSignedVcVp({
  holder,
  domain,
  nonce,
  challengePayload,
  signMessage,
}: VcVpBuildParams): Promise<{ vc: string; vp: string }> {
  const issuedAt = new Date().toISOString();

  const credential = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "DidAuthCredential"],
    issuer: holder,
    issuanceDate: issuedAt,
    credentialSubject: {
      id: holder,
      domain,
      nonce,
      challenge: challengePayload ?? null,
    },
  };

  const vcSignature = await signPayload(credential, signMessage);

  const signedVc = {
    ...credential,
    proof: {
      type: "SolanaSignature2024",
      proofPurpose: "assertionMethod",
      verificationMethod: holder,
      created: issuedAt,
      signatureValue: vcSignature,
    },
  };

  const vpPayload = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation", "DidAuthPresentation"],
    holder,
    domain,
    nonce,
    verifiableCredential: signedVc,
  };

  const vpSignature = await signPayload(vpPayload, signMessage);

  const signedVp = {
    ...vpPayload,
    proof: {
      type: "SolanaSignature2024",
      proofPurpose: "authentication",
      verificationMethod: holder,
      created: new Date().toISOString(),
      signatureValue: vpSignature,
    },
  };

  return {
    vc: JSON.stringify(signedVc),
    vp: JSON.stringify(signedVp),
  };
}
