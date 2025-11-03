// src/app/auth/signup/SignUpView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlusIcon, FingerPrintIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { kycPhoneRequest, kycPhoneVerify } from '@/services/kyc/kycApi';

// ✅ 제네릭 파싱 이슈 회피용: 타입/상수 분리
const KYC_STEPS = {
  IDLE: 'IDLE',
  REQUESTED: 'REQUESTED',
  VERIFIED: 'VERIFIED',
} as const;
type KycStep = typeof KYC_STEPS[keyof typeof KYC_STEPS];

export function SignUpView() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'individual', // 'individual' | 'company'
    agreeTerms: false,
  });

  // KYC 상태
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [kycStep, setKycStep] = useState<KycStep>(KYC_STEPS.IDLE); // ✅

  const [loading, setLoading] = useState(false);

  // ===== 유효성 =====
  const isEmailValid = /\S+@\S+\.\S+/.test(formData.email);
  const isPwFilled = formData.password.length >= 8;
  const isPwMatch = isPwFilled && formData.password === formData.confirmPassword;
  const isNameOk = !!formData.name.trim();
  const numericPhone = phone.replace(/\D/g, '');
  const isPhoneOk = /^\d{10,11}$/.test(numericPhone);

  // 인증번호 확인 버튼 활성 조건
  const isVerifyReady = !!requestId && /^\d{6}$/.test(code) && isNameOk && !loading;

  // 다음 단계 버튼 활성 조건: 모든 입력 + 약관 동의 + KYC 완료
  const isNextEnabled =
    isNameOk && isEmailValid && isPwMatch && formData.agreeTerms && kycStep === KYC_STEPS.VERIFIED && !loading;

  // ===== 이벤트 =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, userType: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPwMatch) {
      alert('비밀번호가 일치하지 않습니다(8자 이상 & 확인일치).');
      return;
    }
    if (!isEmailValid) {
      alert('이메일 형식을 확인해 주세요.');
      return;
    }
    if (!formData.agreeTerms) {
      alert('약관에 동의해 주세요.');
      return;
    }

    // 1) 회원가입 → 2) 로그인/임시토큰 → 3) KYC 진행
    console.log('회원가입 시도:', formData);
    alert('계정이 생성되었습니다. 휴대폰 인증을 진행해 주세요.');
  };

  const handleKycRequest = async () => {
    if (!isPhoneOk) {
      alert('휴대폰 번호를 숫자 10~11자리로 입력해 주세요.');
      return;
    }
    try {
      setLoading(true);
      const resp = await kycPhoneRequest(numericPhone);
      if (resp?.requestId) {
        setRequestId(resp.requestId);
        setKycStep(KYC_STEPS.REQUESTED);
        alert('인증번호를 전송했습니다.');
      } else {
        throw new Error('REQUEST_ID_MISSING');
      }
    } catch (e: any) {
      console.error(e);
      alert(`인증요청 실패: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKycVerify = async () => {
    if (!requestId) {
      alert('먼저 인증번호를 요청해 주세요.');
      return;
    }
    if (!isNameOk) {
      alert('이름(실명)을 입력해 주세요.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      alert('인증번호 6자리를 입력해 주세요.');
      return;
    }
    try {
      setLoading(true);
      const resp = await kycPhoneVerify(requestId, code, formData.name.trim());
      if (resp.kycVerified) {
        setKycStep(KYC_STEPS.VERIFIED);
        alert('본인인증이 완료되었습니다.');
      } else {
        alert('인증 실패. 다시 시도해 주세요.');
      }
    } catch (e: any) {
      console.error(e);
      alert(`인증검증 실패: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!isNextEnabled) return;
    // DID 등 다음 단계로 이동
    router.push('/did');
  };

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">B</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary">새 계정 등록하기</h2>
        <p className="mt-2 text-center text-sm text-secondary-light">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/signin" className="font-medium text-primary hover:text-primary-dark">
            로그인하기
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-card py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="mb-6 rounded-md bg-primary-light p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">보안 강화된 계정</h3>
                <div className="mt-2 text-sm text-primary-dark">
                  <p>PQC(Post Quantum Cryptography) 기반의 보안 시스템으로 미래 양자 컴퓨터의 공격에도 안전한 계정을 제공합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-secondary">
                이름 (실명)
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-secondary">
                이메일 주소
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="name@example.com"
                />
                {!isEmailValid && formData.email && (
                  <p className="text-xs mt-1 text-red-500">이메일 형식을 확인해 주세요.</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-secondary">
                비밀번호
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <p className="mt-1 text-xs text-secondary-light">8자 이상, 대소문자, 숫자, 특수문자를 포함해주세요.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-secondary">
                비밀번호 확인
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              {!isPwMatch && formData.confirmPassword && (
                <p className="text-xs mt-1 text-red-500">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium leading-6 text-secondary mb-2">계정 유형</span>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="individual"
                    name="userType"
                    type="radio"
                    value="individual"
                    checked={formData.userType === 'individual'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="individual" className="ml-2 block text-sm text-secondary-light">
                    개인 (인재)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="company"
                    name="userType"
                    type="radio"
                    value="company"
                    checked={formData.userType === 'company'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="company" className="ml-2 block text-sm text-secondary-light">
                    기업 (프로젝트 등록)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                required
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-secondary-light">
                <span>
                  <Link href="/terms" className="text-primary hover:text-primary-dark">
                    이용약관
                  </Link>{' '}
                  및{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary-dark">
                    개인정보 처리방침
                  </Link>
                  에 동의합니다.
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <FingerPrintIcon className="h-5 w-5 text-secondary-light mr-2" />
              <span className="text-xs text-secondary-light">회원가입 시 본인의 기기에 안전하게 암호화된 개인 키가 생성됩니다.</span>
            </div>

            {/* “다음 단계로 넘어가기” 버튼 */}
            <div className="grid gap-3">
              <button type="submit" className="flex w-full justify-center btn-primary py-3">
                <UserPlusIcon className="h-5 w-5 mr-2" />
                계정 등록하기
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isNextEnabled}
                className={`flex w-full justify-center py-3 rounded-md ${
                  isNextEnabled ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={isNextEnabled ? '' : '모든 입력 완료 및 본인인증 완료 후 활성화됩니다.'}
              >
                다음 단계로 넘어가기
              </button>
            </div>
          </form>

          {/* --- KYC 섹션 --- */}
          <div className="mt-10 space-y-4">
            <h3 className="text-lg font-semibold text-secondary">휴대폰 본인인증</h3>

            <div>
              <label className="block text-sm font-medium leading-6 text-secondary">휴대폰 번호</label>
              <input
                type="tel"
                className="input-field mt-2"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
              <button
                type="button"
                onClick={handleKycRequest}
                disabled={loading || !isPhoneOk}
                className={`mt-3 rounded-md py-2 px-3 ${
                  loading || !isPhoneOk ? 'bg-gray-300 text-gray-500' : 'btn-secondary'
                }`}
                title={!isPhoneOk ? '숫자 10~11자리로 입력해 주세요.' : ''}
              >
                인증번호 요청
              </button>
            </div>

            {kycStep !== KYC_STEPS.IDLE && (
              <div>
                <label className="block text-sm font-medium leading-6 text-secondary">인증번호 (6자리)</label>
                <input
                  type="text"
                  className="input-field mt-2"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                />
                <button
                  type="button"
                  onClick={handleKycVerify}
                  disabled={!isVerifyReady}
                  className={`mt-3 rounded-md py-2 px-3 ${
                    !isVerifyReady ? 'bg-gray-300 text-gray-500' : 'btn-primary'
                  }`}
                  title={!isVerifyReady ? '이름 입력, 인증요청 완료, 6자리 코드 입력 후 가능합니다.' : ''}
                >
                  인증 확인(이름 저장)
                </button>

                {kycStep === KYC_STEPS.VERIFIED && (
                  <p className="mt-2 text-sm text-green-500">인증 완료! 이제 다음 단계 버튼이 활성화됩니다.</p>
                )}
              </div>
            )}
          </div>
          {/* --- /KYC 섹션 --- */}

          {/* 소셜 영역 생략 가능 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background-card px-2 text-secondary-light">소셜 계정으로 계속하기</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="#"
                  className="inline-flex w-full justify-center rounded-md bg-background px-4 py-2 text-secondary shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <span className="sr-only">Google로 가입</span>
                  Google
                </a>
              </div>
              <div>
                <a
                  href="#"
                  className="inline-flex w-full justify-center rounded-md bg-background px-4 py-2 text-secondary shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  <span className="sr-only">GitHub로 가입</span>
                  GitHub
                </a>
              </div>
            </div>
          </div>
          {/* --- /소셜 영역 --- */}
        </div>
      </div>
    </div>
  );
}
