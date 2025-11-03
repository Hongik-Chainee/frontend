// src/viewmodels/PersonalInfoViewModel.ts
import { kycPhoneRequest, kycPhoneVerify } from "@/services/kyc/kycApi";

export type TelCarrier = 'SKT' | 'KT' | 'LGU+' | '';

export class PersonalInfoViewModel {
  // 약관
  agreeAll = false;
  agreeRequired = {
    privacy: false,
    idService: false,
    thirdParty: false,
    telTerms: false,
  };

  setAgreeAll(v: boolean) {
    this.agreeAll = v;
    (Object.keys(this.agreeRequired) as (keyof typeof this.agreeRequired)[])
      .forEach(k => { this.agreeRequired[k] = v; });
  }
  setAgree(key: keyof typeof this.agreeRequired, v: boolean) {
    this.agreeRequired[key] = v;
    this.agreeAll = Object.values(this.agreeRequired).every(Boolean);
  }
  get allRequiredAgreed() {
    return Object.values(this.agreeRequired).every(Boolean);
  }

  // 휴대폰 인증 (UI 상태)
  name = '';
  rrnFront = '';    // 생년월일 6자리
  rrnBack  = '';    // 뒤 1자리(UI)
  carrier: TelCarrier = '';
  phone = '';
  code  = '';

  requested = false;
  verified  = false;

  requestId: string | null = null;

  /** 인증번호 요청 가능 여부 */
  canRequest() {
    return !!this.name.trim()
      && this.rrnFront.length === 6
      && this.rrnBack.length === 1
      && !!this.carrier
      && /^\d{10,11}$/.test(this.phone);
  }

  /** 인증번호 확인(검증) 가능 여부 */
  canConfirm() {
    return this.requested
      && !!this.name.trim()
      && /^\d{6}$/.test(this.code)
      && !!this.requestId;
  }

  /** 다음 단계로 이동 가능 여부: 약관 모두 동의 + KYC 인증 완료 */
  get canGoNext() {
    return this.allRequiredAgreed && this.verified;
  }

  async requestCodeReal(): Promise<boolean> {
    if (!this.canRequest()) return false;
    const { requestId } = await kycPhoneRequest(this.phone);
    this.requestId = requestId;
    this.requested = true;
    return true;
  }

  async confirmCodeReal(): Promise<boolean> {
    if (!this.canConfirm()) return false;
    const resp = await kycPhoneVerify(this.requestId!, this.code, this.name.trim());
    this.verified = !!resp.kycVerified;
    return this.verified;
  }
}
