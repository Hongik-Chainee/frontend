'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// 더미 평판 뱃지 데이터
const badges = [
  {
    id: 1,
    name: '프론트엔드 마스터',
    description: '프론트엔드 개발 분야에서 뛰어난 성과를 보인 개발자에게 부여됩니다.',
    category: 'skill',
    image: '/badges/frontend.png',
    rarity: 'rare',
    issuedCount: 156,
    requirements: '5개 이상의 프론트엔드 프로젝트 완료 및 4.5 이상의 평점',
  },
  {
    id: 2,
    name: '스마트 계약 전문가',
    description: '블록체인 스마트 계약 개발에 전문성을 보유한 개발자에게 부여됩니다.',
    category: 'skill',
    image: '/badges/smart-contract.png',
    rarity: 'epic',
    issuedCount: 78,
    requirements: '3개 이상의 스마트 계약 기반 프로젝트 개발 및 보안 감사 통과',
  },
  {
    id: 3,
    name: '신뢰할 수 있는 협업자',
    description: '팀 프로젝트에서 높은 신뢰성과 협업 능력을 보인 팀원에게 부여됩니다.',
    category: 'soft-skill',
    image: '/badges/team-player.png',
    rarity: 'common',
    issuedCount: 312,
    requirements: '10개 이상의 팀 프로젝트 완료 및 팀원 평가 4.0 이상',
  },
  {
    id: 4,
    name: '문제 해결사',
    description: '복잡한 기술적 과제를 창의적으로 해결한 개발자에게 부여됩니다.',
    category: 'achievement',
    image: '/badges/problem-solver.png',
    rarity: 'rare',
    issuedCount: 142,
    requirements: '프로젝트 중 중요한 문제 해결 공헌 및 동료 평가',
  },
  {
    id: 5,
    name: '양자 내성 암호화 전문가',
    description: 'PQC(Dilithium, Falcon) 등 양자 내성 암호화 기술 구현에 기여한 전문가에게 부여됩니다.',
    category: 'skill',
    image: '/badges/quantum.png',
    rarity: 'legendary',
    issuedCount: 23,
    requirements: 'PQC 기반 블록체인 시스템 구현 및 보안 검증',
  },
  {
    id: 6,
    name: '신속한 완료자',
    description: '기한 내에 고품질의 결과물을 제공하는 전문가에게 부여됩니다.',
    category: 'soft-skill',
    image: '/badges/fast-delivery.png',
    rarity: 'common',
    issuedCount: 287,
    requirements: '모든 기한 준수 및 5개 이상의 프로젝트 조기 완료',
  },
];

// 더미 내 평판 데이터
const myReputation = {
  score: 4.7,
  total_projects: 15,
  completed_projects: 14,
  badges: [
    {
      id: 2,
      name: '스마트 계약 전문가',
      image: '/badges/smart-contract.png',
      tokenId: 'NFT-SC-42187',
      issuedDate: '2023-03-15',
      issuer: '블록체인랩스',
    },
    {
      id: 3,
      name: '신뢰할 수 있는 협업자',
      image: '/badges/team-player.png',
      tokenId: 'NFT-TP-78923',
      issuedDate: '2023-04-22',
      issuer: '디지털헤리티지',
    },
    {
      id: 6,
      name: '신속한 완료자',
      image: '/badges/fast-delivery.png',
      tokenId: 'NFT-FD-12644',
      issuedDate: '2023-05-01',
      issuer: '미래티켓(주)',
    },
  ],
};

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

// 희귀도에 따른 배지 스타일
const getRarityBadge = (rarity: string) => {
  switch(rarity) {
    case 'common':
      return 'bg-gray-100 text-gray-800';
    case 'rare':
      return 'bg-blue-100 text-blue-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
    case 'legendary':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// 희귀도 텍스트
const getRarityText = (rarity: string) => {
  switch(rarity) {
    case 'common':
      return '일반';
    case 'rare':
      return '희귀';
    case 'epic':
      return '영웅';
    case 'legendary':
      return '전설';
    default:
      return '일반';
  }
};

export default function Reputation() {
  const [activeTab, setActiveTab] = useState('badges');

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 페이지 헤더 */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">NFT 기반 평판 시스템</h1>
            <p className="mt-2 text-base text-gray-200">
              프로젝트 완료 시 획득하는 NFT 기반 평판 뱃지로 자신의 전문성과 성과를 증명하세요.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/reputation/history"
              className="btn-primary"
            >
              내 평판 기록 보기
            </Link>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('badges')}
              className={`${
                activeTab === 'badges'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              사용 가능한 평판 뱃지
            </button>
            <button
              onClick={() => setActiveTab('my-reputation')}
              className={`${
                activeTab === 'my-reputation'
                  ? 'border-primary text-white'
                  : 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              내 평판 현황
            </button>
          </nav>
        </div>

        {/* 뱃지 목록 탭 컨텐츠 */}
        {activeTab === 'badges' && (
          <motion.div 
            className="mt-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <div className="rounded-lg bg-background-card shadow-sm p-6 mb-8">
              <h2 className="text-lg font-medium text-white mb-4">NFT 평판 시스템이란?</h2>
              <p className="text-gray-200">
                BlockTalent의 NFT 평판 시스템은 프로젝트 완료 시 참여자의 기여도와 성과를 증명하는 NFT를 발행합니다. 
                이 디지털 자산은 블록체인에 기록되어 변조가 불가능하고, 이력 추적이 가능합니다. 
                귀하의 전문성과 성과를 NFT로 증명하고, 미래 프로젝트에서 더 나은 기회를 얻으세요.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-3 rounded-lg bg-primary-light p-4">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">변조 불가능한 증명</span>
                </div>
                <div className="flex items-center space-x-3 rounded-lg bg-primary-light p-4">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">기여도 기반 발행</span>
                </div>
                <div className="flex items-center space-x-3 rounded-lg bg-primary-light p-4">
                  <TrophyIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">우선 매칭 혜택</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <motion.div 
                  key={badge.id}
                  className="card group overflow-hidden"
                  variants={fadeIn}
                >
                  <div className="relative">
                    <div className="h-40 w-full bg-gradient-to-r from-primary-light to-accent-light rounded-t-lg flex items-center justify-center">
                      <div className="h-24 w-24 bg-background-card rounded-full flex items-center justify-center">
                        <TrophyIcon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <span className={`absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRarityBadge(badge.rarity)}`}>
                      {getRarityText(badge.rarity)}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary">{badge.name}</h3>
                    <p className="mt-2 text-sm text-gray-200">{badge.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">발행 수</span>
                        <span className="font-medium text-white">{badge.issuedCount}개</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-300">카테고리</span>
                        <span className="font-medium text-white">
                          {badge.category === 'skill' ? '기술 역량' : 
                           badge.category === 'soft-skill' ? '소프트 스킬' : '업적'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-white">획득 요건</h4>
                      <p className="mt-1 text-xs text-gray-200">{badge.requirements}</p>
                    </div>
                    
                    <div className="mt-6">
                      <Link 
                        href={`/reputation/badges/${badge.id}`}
                        className="text-accent hover:text-accent-light text-sm font-medium flex items-center"
                      >
                        자세히 보기
                        <span aria-hidden="true" className="ml-1">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 내 평판 현황 탭 컨텐츠 */}
        {activeTab === 'my-reputation' && (
          <motion.div 
            className="mt-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="rounded-lg bg-background-card shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:items-center">
                    <div className="h-20 w-20 rounded-full bg-primary-light flex items-center justify-center">
                      <UserCircleIcon className="h-14 w-14 text-white" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <div className="text-sm text-gray-300">전체 평판 점수</div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-white">{myReputation.score}</span>
                        <span className="ml-2 text-sm text-gray-300">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-6 sm:mt-0 sm:grid-cols-2 lg:grid-cols-2">
                    <div>
                      <div className="text-sm text-gray-300">완료한 프로젝트</div>
                      <div className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-white">{myReputation.completed_projects}</span>
                        <span className="ml-2 text-sm text-gray-300">/ {myReputation.total_projects}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">획득한 뱃지</div>
                      <div className="mt-1 flex items-baseline">
                        <span className="text-2xl font-semibold text-white">{myReputation.badges.length}</span>
                        <span className="ml-2 text-sm text-gray-300">개</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-white">내 NFT 뱃지</h3>
                <p className="mt-1 text-sm text-gray-200">
                  프로젝트 완료 후 획득한 NFT 뱃지는 블록체인에 기록되어 영구적으로 보존됩니다.
                </p>
                
                <div className="mt-6 space-y-6">
                  {myReputation.badges.map((badge) => (
                    <div key={badge.id} className="flex items-start bg-background-card/70 backdrop-blur-sm border border-accent/20 rounded-lg overflow-hidden">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-light to-accent-light rounded-l-lg flex items-center justify-center">
                        <TrophyIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1 px-4 py-4">
                        <h4 className="text-lg font-medium text-white">{badge.name}</h4>
                        <div className="mt-1 text-sm text-gray-200">발행: {badge.issuer}</div>
                        <div className="mt-1 text-sm text-gray-200">발행일: {badge.issuedDate}</div>
                      </div>
                      <div className="flex flex-col justify-between p-4 border-l border-gray-700/50">
                        <div className="text-sm text-gray-200 font-medium text-right">
                          Token ID: <span className="text-accent">{badge.tokenId}</span>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button 
                            type="button"
                            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-light"
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                            전송
                          </button>
                          <button 
                            type="button"
                            className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-accent-light"
                          >
                            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                            공유
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 rounded-lg bg-secondary-dark p-6 text-white">
              <h3 className="text-lg font-medium text-white">평판 점수 향상 방법</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs">1</span>
                  <span className="text-white">프로젝트를 성공적으로 완료하고 기한을 준수하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs">2</span>
                  <span className="text-white">팀원들과 적극적으로 협업하고 소통하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs">3</span>
                  <span className="text-white">프로젝트에서 발생하는 문제를 창의적으로 해결하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-xs">4</span>
                  <span className="text-white">특정 기술 분야에서 전문성을 쌓고 증명하세요.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 