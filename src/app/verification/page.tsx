'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon,
  FingerPrintIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  QrCodeIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ShareIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// 애니메이션 변수
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// 더미 검증 데이터
const verifications = [
  {
    id: 1,
    title: '학력 증명',
    description: '대학교 졸업장 및 성적 증명서',
    status: 'verified',
    date: '2023-01-15',
    expiryDate: '영구적',
    issuer: '서울대학교',
    blockchainId: '0x7c8e9fd2b4a3e9a9b9d8e1f8a7c6b5a4d3c2b1a0',
  },
  {
    id: 2,
    title: '자격증 검증',
    description: '블록체인 개발자 자격증',
    status: 'verified',
    date: '2023-03-22',
    expiryDate: '2025-03-22',
    issuer: '한국블록체인협회',
    blockchainId: '0x8d7f6e5d4c3b2a1b0a9f8e7d6c5b4a3f2e1d0c9',
  },
  {
    id: 3,
    title: '경력 증명',
    description: '(주)블록테크 근무 경력 (2019-2022)',
    status: 'verified',
    date: '2022-12-10',
    expiryDate: '영구적',
    issuer: '(주)블록테크',
    blockchainId: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0',
  },
  {
    id: 4,
    title: '프로젝트 참여 증명',
    description: '디파이 프로젝트 스마트 계약 개발',
    status: 'pending',
    date: '2023-06-05',
    expiryDate: '-',
    issuer: '디파이프로젝트',
    blockchainId: '',
  },
];

export default function Verification() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 페이지 헤더 */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-web3-cyan to-web3-purple">블록체인 검증 시스템</span>
            </h1>
            <p className="mt-2 text-base text-gray-200 font-medium">
              블록체인 기술을 활용한 신원 및 경력 검증으로 신뢰할 수 있는 정보를 제공하세요.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/verification/add"
              className="bg-gradient-to-r from-web3-cyan to-web3-purple text-white font-semibold py-2 px-4 rounded-md hover:shadow-[0_0_20px_rgba(0,208,255,0.5)] transition-all inline-flex items-center"
            >
              <PlusCircleIcon className="mr-2 h-5 w-5" />
              새 증명서 추가
            </Link>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mt-8 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('about')}
              className={`${
                activeTab === 'about'
                  ? 'border-accent text-accent font-medium'
                  : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors duration-200`}
            >
              <DocumentTextIcon className="mr-2 h-5 w-5" />
              검증 시스템 소개
            </button>
            <button
              onClick={() => setActiveTab('my-verification')}
              className={`${
                activeTab === 'my-verification'
                  ? 'border-accent text-accent font-medium'
                  : 'border-transparent text-gray-300 hover:border-gray-400 hover:text-white'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium flex items-center transition-colors duration-200`}
            >
              <CheckBadgeIcon className="mr-2 h-5 w-5" />
              내 검증 문서
            </button>
          </nav>
        </div>

        {/* 검증 시스템 소개 탭 */}
        {activeTab === 'about' && (
          <motion.div 
            className="mt-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="rounded-lg bg-background-card/90 backdrop-blur-sm shadow-lg p-8 mb-8 border border-web3-cyan/20 web3-glow">
              <h2 className="text-2xl font-semibold text-white mb-4">안전하고 신뢰할 수 있는 블록체인 검증 시스템</h2>
              <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                BlockTalent의 검증 시스템은 블록체인 기술을 활용하여 개인의 학력, 경력, 자격증을 안전하게 검증하고 증명합니다.
                모든 검증 기록은 블록체인에 저장되어 위변조가 불가능하며, 개인 데이터는 본인의 단말에 저장되어 보안을 강화합니다.
              </p>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <motion.div 
                  className="rounded-lg bg-gradient-to-br from-background-card/80 to-background-dark/80 border border-web3-cyan/30 p-6 shadow-md hover:shadow-lg hover:shadow-web3-cyan/20 transition-all duration-300"
                  variants={fadeIn}
                >
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-web3-cyan to-web3-blue text-white mb-4">
                    <LockClosedIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">PQC 암호화</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    Dilithium, Falcon과 같은 양자내성암호(PQC)를 적용하여 양자 컴퓨터에도 안전한 검증 시스템을 제공합니다.
                  </p>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-gradient-to-br from-background-card/80 to-background-dark/80 border border-web3-cyan/30 p-6 shadow-md hover:shadow-lg hover:shadow-web3-cyan/20 transition-all duration-300"
                  variants={fadeIn}
                >
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-web3-blue to-web3-purple text-white mb-4">
                    <FingerPrintIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">분산 신원 인증</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    개인의 신원 정보를 본인이 직접 관리하는 분산형 신원인증(DID) 시스템으로 개인정보 보호와 통제권을 강화합니다.
                  </p>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-gradient-to-br from-background-card/80 to-background-dark/80 border border-web3-cyan/30 p-6 shadow-md hover:shadow-lg hover:shadow-web3-cyan/20 transition-all duration-300"
                  variants={fadeIn}
                >
                  <div className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-web3-purple to-web3-cyan text-white mb-4">
                    <DocumentTextIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">선택적 공개</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    검증된 정보 중 필요한 부분만 선택적으로 공개할 수 있어, 불필요한 개인정보 노출 없이 신뢰를 구축할 수 있습니다.
                  </p>
                </motion.div>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-web3-cyan to-web3-blue">
                  <ClockIcon className="h-6 w-6 mr-2 text-web3-cyan inline" />
                  검증 프로세스
                </span>
              </h2>
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-gradient-to-r from-web3-cyan/30 to-web3-purple/30" />
                </div>
                <div className="relative flex justify-between">
                  <motion.div 
                    className="flex items-center flex-col"
                    variants={fadeIn}
                  >
                    <span className="bg-gradient-to-r from-web3-cyan to-web3-blue h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-web3-cyan/30">1</span>
                    <span className="mt-3 bg-background px-4 text-white font-medium">문서 제출</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center flex-col"
                    variants={fadeIn}
                  >
                    <span className="bg-gradient-to-r from-web3-blue to-web3-purple h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-web3-blue/30">2</span>
                    <span className="mt-3 bg-background px-4 text-white font-medium">검증 기관 확인</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center flex-col"
                    variants={fadeIn}
                  >
                    <span className="bg-gradient-to-r from-web3-purple to-web3-blue h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-web3-purple/30">3</span>
                    <span className="mt-3 bg-background px-4 text-white font-medium">블록체인 기록</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center flex-col"
                    variants={fadeIn}
                  >
                    <span className="bg-gradient-to-r from-web3-blue to-web3-cyan h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-web3-cyan/30">4</span>
                    <span className="mt-3 bg-background px-4 text-white font-medium">검증 완료</span>
                  </motion.div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <motion.div 
                  className="rounded-lg bg-background-card/80 backdrop-blur-sm p-8 shadow-md border border-web3-cyan/20 hover:shadow-lg hover:shadow-web3-cyan/10 transition-all duration-300"
                  variants={fadeIn}
                >
                  <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                    <DocumentTextIcon className="h-6 w-6 mr-2 text-web3-cyan" />
                    검증 가능한 문서 유형
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">학위 증명서 및 학력 관련 서류</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">직업 자격증 및 전문 인증서</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">경력 증명서 및 근무 이력</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">프로젝트 참여 증명 및 성과</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">기술 역량 및 전문성 증명</span>
                    </li>
                  </ul>
                </motion.div>

                <motion.div 
                  className="rounded-lg bg-background-card/80 backdrop-blur-sm p-8 shadow-md border border-web3-cyan/20 hover:shadow-lg hover:shadow-web3-cyan/10 transition-all duration-300"
                  variants={fadeIn}
                >
                  <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                    <CheckBadgeIcon className="h-6 w-6 mr-2 text-web3-cyan" />
                    검증 파트너 기관
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">주요 대학 및 교육 기관</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">IT 기업 및 기술 기업</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">전문 자격증 발급 기관</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">정부 기관 및 공공 단체</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-web3-cyan mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-200">블록체인 협회 및 연구 단체</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
            
            <div className="mt-12 rounded-lg bg-gradient-to-br from-secondary-dark to-background-dark p-8 text-white relative overflow-hidden shadow-lg border border-web3-purple/30">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <QrCodeIcon className="h-48 w-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-web3-cyan to-web3-purple">지금 바로 검증을 시작하세요</h3>
                <p className="max-w-3xl mb-6 leading-relaxed text-gray-200">
                  블록체인 기술로 검증된 신원과 경력 정보는 더 높은 신뢰를 구축하고, 더 나은 기회를 제공합니다.
                  간단한 단계로 당신의 문서를 검증하고, 블록체인의 신뢰성을 경험하세요.
                </p>
                <Link
                  href="/verification/add"
                  className="bg-gradient-to-r from-web3-cyan to-web3-purple text-white font-semibold py-2 px-4 rounded-md hover:shadow-[0_0_20px_rgba(0,208,255,0.5)] transition-all inline-flex items-center"
                >
                  <PlusCircleIcon className="mr-2 h-5 w-5" />
                  검증 문서 추가하기
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* 내 검증 문서 탭 */}
        {activeTab === 'my-verification' && (
          <motion.div 
            className="mt-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="overflow-hidden rounded-lg bg-background-card/80 backdrop-blur-sm shadow-md border border-web3-cyan/20 web3-glow">
              <ul role="list" className="divide-y divide-gray-700/30">
                {verifications.map((verification) => (
                  <li key={verification.id} className="p-6 sm:p-8 hover:bg-background-dark/40 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 rounded-md p-3 shadow-lg ${
                          verification.status === 'verified' 
                            ? 'bg-gradient-to-br from-green-500/20 to-green-700/20 border border-green-500/30' 
                            : 'bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 border border-yellow-500/30'
                        }`}>
                          <DocumentTextIcon 
                            className={`h-7 w-7 ${
                              verification.status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                            }`} 
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-white flex items-center">
                            {verification.title}
                            {verification.status === 'verified' && (
                              <CheckBadgeIcon className="ml-1 h-5 w-5 text-web3-cyan" />
                            )}
                          </h3>
                          <p className="text-gray-200 font-medium">{verification.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex flex-col items-end">
                        <span 
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium shadow-sm ${
                            verification.status === 'verified' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {verification.status === 'verified' ? (
                            <><CheckCircleIcon className="h-4 w-4 mr-1" /> 검증 완료</>
                          ) : (
                            <><ClockIcon className="h-4 w-4 mr-1" /> 검증 중</>
                          )}
                        </span>
                        <span className="mt-2 text-sm text-gray-300">
                          {verification.date} 등록
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 bg-background-dark/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/30">
                      <div className="flex items-start">
                        <CheckBadgeIcon className="h-5 w-5 text-web3-cyan mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-300">발급 기관</div>
                          <div className="mt-1 text-white font-medium">{verification.issuer}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <ClockIcon className="h-5 w-5 text-web3-cyan mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-300">만료일</div>
                          <div className="mt-1 text-white font-medium">{verification.expiryDate}</div>
                        </div>
                      </div>
                      {verification.blockchainId && (
                        <div className="flex items-start">
                          <QrCodeIcon className="h-5 w-5 text-web3-cyan mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-300">블록체인 ID</div>
                            <div className="mt-1 text-white font-medium truncate max-w-xs">
                              <span className="bg-clip-text text-transparent bg-gradient-to-r from-web3-cyan to-web3-purple">{verification.blockchainId}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      {verification.status === 'verified' ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-background-card border border-web3-cyan/30 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-web3-cyan/20 hover:border-web3-cyan/50 transition-all duration-200"
                          >
                            <ShareIcon className="mr-2 h-5 w-5 text-web3-cyan" />
                            공유하기
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-gradient-to-r from-web3-cyan to-web3-purple px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-[0_0_15px_rgba(0,208,255,0.4)] transition-all duration-200"
                          >
                            <EyeIcon className="mr-2 h-5 w-5" />
                            상세 보기
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-background-card border border-web3-cyan/30 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-web3-cyan/20 hover:border-web3-cyan/50 transition-all duration-200"
                        >
                          <ClockIcon className="mr-2 h-5 w-5 text-web3-cyan" />
                          검증 상태 확인
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {verifications.length === 0 && (
              <div className="text-center py-12 bg-background-card/80 backdrop-blur-sm rounded-lg shadow-md border border-web3-cyan/20 mt-8 web3-glow">
                <DocumentTextIcon className="mx-auto h-16 w-16 text-web3-cyan/40" />
                <h3 className="mt-4 text-xl font-medium text-white">검증 문서가 없습니다</h3>
                <p className="mt-2 text-gray-200">
                  새 문서를 추가하여 블록체인 검증을 시작하세요.
                </p>
                <div className="mt-6">
                  <Link
                    href="/verification/add"
                    className="bg-gradient-to-r from-web3-cyan to-web3-purple text-white font-semibold py-2 px-4 rounded-md hover:shadow-[0_0_20px_rgba(0,208,255,0.5)] transition-all inline-flex items-center"
                  >
                    <PlusCircleIcon className="mr-2 h-5 w-5" />
                    첫 문서 추가하기
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 