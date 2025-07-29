'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  FolderIcon,
  ChatBubbleLeftIcon as ChatIcon
} from '@heroicons/react/24/outline';

// 프로젝트 타입 정의
interface Project {
  name: string;
  description: string;
}

// 인재 타입 정의
interface Talent {
  id: number;
  name: string;
  title: string;
  avatar: string;
  skills: string[];
  experience: string;
  company: string;
  rating: number;
  projects: number;
  bio: string;
  availability: string;
  verified: boolean;
  location: string;
  keyProjects: Project[];
}

// 더미 인재 데이터
const talents: Talent[] = [
  {
    id: 1,
    name: '김블록',
    title: '시니어 블록체인 개발자',
    avatar: '/avatars/profile1.jpg',
    skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'DeFi'],
    experience: '7년',
    company: '블록체인랩스',
    rating: 4.9,
    projects: 23,
    bio: '이더리움과 솔리디티 기반 스마트 계약 개발 전문가입니다. 다양한 DeFi 프로토콜 개발에 참여했으며, 보안 감사 경험도 풍부합니다.',
    availability: 'full-time',
    verified: true,
    location: '서울',
    keyProjects: [
      { name: 'DeFi 스왑 프로토콜', description: '이더리움 기반 탈중앙화 거래소 개발' },
      { name: 'NFT 마켓플레이스', description: '디지털 아트 거래 플랫폼 구축' }
    ]
  },
  {
    id: 2,
    name: '이퀀텀',
    title: '양자암호 연구원',
    avatar: '/avatars/profile2.jpg',
    skills: ['Quantum Cryptography', 'PQC', 'Cryptography', 'C++'],
    experience: '5년',
    company: '퀀텀시큐리티',
    rating: 4.7,
    projects: 12,
    bio: '양자컴퓨터 시대를 대비한 암호화 알고리즘 연구 및 구현 전문가입니다. Dilithium, Falcon과 같은 PQC 알고리즘에 대한 깊은 이해를 가지고 있습니다.',
    availability: 'contract',
    verified: true,
    location: '대전',
    keyProjects: [
      { name: '양자내성 암호 라이브러리', description: '포스트 퀀텀 암호화 구현' },
      { name: '보안 감사 시스템', description: '스마트 컨트랙트 취약점 분석 도구' }
    ]
  },
  {
    id: 3,
    name: '박AI',
    title: '머신러닝 엔지니어',
    avatar: '/avatars/profile3.jpg',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'AI', 'Data Science'],
    experience: '4년',
    company: '데이터마인드',
    rating: 4.5,
    projects: 15,
    bio: '블록체인 데이터 분석 및 예측 모델 개발 전문가입니다. 협업 필터링과 딥러닝 기반 추천 시스템 구현 경험이 있습니다.',
    availability: 'part-time',
    verified: true,
    location: '성남시',
    keyProjects: [
      { name: '블록체인 데이터 분석', description: '트랜잭션 패턴 분석 및 이상 감지' },
      { name: 'AI 기반 가격 예측', description: '암호화폐 시장 예측 모델 개발' }
    ]
  },
  {
    id: 4,
    name: '최프론트',
    title: 'UI/UX 디자이너 & 프론트엔드 개발자',
    avatar: '/avatars/profile4.jpg',
    skills: ['React', 'TypeScript', 'Web3.js', 'UI/UX', 'Figma'],
    experience: '6년',
    company: '디자인블록',
    rating: 4.8,
    projects: 28,
    bio: '블록체인 DApp의 사용자 경험에 중점을 둔 디자인 및 프론트엔드 개발을 전문으로 합니다. 복잡한 블록체인 기능을 직관적인 UI로 구현합니다.',
    availability: 'full-time',
    verified: true,
    location: '서울',
    keyProjects: [
      { name: '지갑 연동 UI/UX', description: '사용성 개선된 웹3 지갑 인터페이스' },
      { name: '대시보드 시스템', description: 'DeFi 포트폴리오 모니터링 플랫폼' }
    ]
  },
  {
    id: 5,
    name: '정모바일',
    title: '모바일 앱 개발자',
    avatar: '/avatars/profile5.jpg',
    skills: ['React Native', 'Flutter', 'Mobile Development', 'Blockchain Integration'],
    experience: '3년',
    company: '앱체인',
    rating: 4.4,
    projects: 10,
    bio: '블록체인 기술을 모바일 앱에 통합하는 전문 개발자입니다. 분산형 신원인증(DID) 및 암호화폐 지갑 구현 경험이 있습니다.',
    availability: 'contract',
    verified: true,
    location: '부산',
    keyProjects: [
      { name: '모바일 월렛', description: '다중 블록체인 지원 암호화폐 지갑' },
      { name: 'DID 인증 앱', description: '탈중앙화 신원인증 모바일 애플리케이션' }
    ]
  },
  {
    id: 6,
    name: '한보안',
    title: '블록체인 보안 전문가',
    avatar: '/avatars/profile6.jpg',
    skills: ['Security Audit', 'Pen Testing', 'Smart Contract Security', 'Cryptography'],
    experience: '8년',
    company: '시큐블록',
    rating: 4.9,
    projects: 35,
    bio: '블록체인 플랫폼 및 스마트 계약의 취약점 분석 및 보안 감사 전문가입니다. 다수의 중요 DeFi 프로젝트 보안 감사를 수행했습니다.',
    availability: 'full-time',
    verified: true,
    location: '서울',
    keyProjects: [
      { name: '스마트 컨트랙트 감사', description: '주요 DeFi 프로토콜 취약점 분석' },
      { name: '보안 프레임워크 개발', description: '블록체인 애플리케이션 보안 테스트 도구' }
    ]
  },
];

// 애니메이션 변수
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Matching() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    experience: '',
    availability: '',
  });
  
  // 필터링 함수
  const filterTalents = (talent: Talent) => {
    return (
      talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // 가용성에 따른 배지 스타일
  const getAvailabilityBadge = (availability: string) => {
    switch(availability) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'contract':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 가용성 텍스트
  const getAvailabilityText = (availability: string) => {
    switch(availability) {
      case 'full-time':
        return '풀타임';
      case 'part-time':
        return '파트타임';
      case 'contract':
        return '계약직';
      default:
        return '기타';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 페이지 헤더 */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white mb-2">인재 매칭</h1>
            <p className="text-lg text-gray-200">
              블록체인 검증 및 AI 추천 시스템으로 최적의 인재를 찾아보세요.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              href="/profile/edit"
              className="btn-primary"
            >
              인재 프로필 등록하기
            </Link>
          </div>
        </div>

        {/* AI 매칭 설명 */}
        <motion.div 
          className="mt-10 bg-primary rounded-xl overflow-hidden shadow-xl"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="px-6 py-12 sm:px-12 lg:flex lg:items-center lg:py-16">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                AI 매칭 시스템
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-100">
                기업의 요구사항과 인재의 스킬, 평판, 프로젝트 이력을 분석하여 최적의 매칭을 추천해드립니다.
                블록체인 기술로 검증된 경력과 평판을 확인하세요.
              </p>
              <div className="mt-8">
                <Link 
                  href="/matching/ai"
                  className="btn-accent"
                >
                  AI 매칭 시작하기
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:ml-8 lg:flex-1">
              <div className="relative aspect-[4/3] rounded-lg bg-secondary-dark p-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg className="h-full w-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM80 80C73.5 86.5 65.3 90.8 56.3 92.8C47.2 94.8 37.8 94.2 29.1 91.1C20.4 88 12.9 82.5 7.4 75.2C1.9 67.9 -0.7 59.1 -0.7 50C-0.7 40.9 1.9 32.1 7.4 24.8C12.9 17.5 20.4 12 29.1 8.9C37.8 5.8 47.2 5.2 56.3 7.2C65.3 9.2 73.5 13.5 80 20C86.5 26.5 90.8 34.7 92.8 43.7C94.8 52.8 94.2 62.2 91.1 70.9C88 79.6 82.5 87.1 75.2 92.6C67.9 98.1 59.1 100.7 50 100.7C40.9 100.7 32.1 98.1 24.8 92.6" stroke="#ffffff" strokeWidth="2"/>
                    <path d="M50 20V80M20 50H80" stroke="#ffffff" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="relative z-10 rounded-lg bg-accent bg-opacity-10 p-4">
                  <ul className="space-y-3">
                    <li className="flex items-center text-white">
                      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold">1</span>
                      <span className="font-medium">콘텐츠 기반 필터링</span> - 요구사항과 스킬 매칭
                    </li>
                    <li className="flex items-center text-white">
                      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold">2</span>
                      <span className="font-medium">협업 필터링</span> - 성과 데이터 기반 추천
                    </li>
                    <li className="flex items-center text-white">
                      <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold">3</span>
                      <span className="font-medium">딥러닝 모델</span> - 협업 스타일 및 평판 분석
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 검색 및 필터 섹션 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="이름, 직함, 기술 스택 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-background-card px-4 py-2 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-700"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              필터
            </button>
          </div>
        </div>

        {/* 인재 목록 */}
        <div className="mt-8 flow-root">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {talents.filter(filterTalents).map((talent, index) => (
              <motion.div 
                key={talent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="card mb-6"
              >
                <div className="flex flex-col md:flex-row items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-lg mr-4 flex-shrink-0">
                      {talent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="text-xl font-bold text-white mr-2">{talent.name}</h3>
                        {talent.verified && (
                          <span className="inline-flex items-center rounded-full bg-green-100/20 px-1.5 py-0.5 text-xs font-medium text-green-400 border border-green-400/30">
                            검증됨
                          </span>
                        )}
                      </div>
                      <p className="text-accent font-medium mb-3">{talent.title}</p>
                      <div className="mb-4">
                        <p className="text-gray-200 text-sm line-clamp-2">{talent.bio}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col mt-4 md:mt-0 md:ml-4 space-x-2 md:space-x-0 md:space-y-2 md:text-right md:items-end">
                    {/* 평점 배지 */}
                    <div className="badge bg-accent/20">
                      <StarIcon className="h-3 w-3 mr-1 text-yellow-400" />
                      <span className="font-bold">{talent.rating}</span>/5.0
                    </div>
                    
                    {/* 프로젝트 수 배지 */}
                    <div className="badge bg-primary/20">
                      <span className="font-bold">{talent.projects}</span>개 프로젝트
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-2">스킬</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {talent.skills.map(skill => (
                        <span 
                          key={skill} 
                          className="inline-flex items-center rounded-full bg-background-dark/50 px-2.5 py-1 text-xs text-gray-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-2">정보</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <BriefcaseIcon className="h-4 w-4 mr-2 text-accent" />
                        <span className="text-highlight text-sm">{talent.experience} 경력</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-accent" />
                        <span className="text-highlight text-sm">{getAvailabilityText(talent.availability)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-accent" />
                        <span className="text-highlight text-sm">{talent.location}</span>
                      </div>
                      <div className="flex items-center">
                        <BuildingOffice2Icon className="h-4 w-4 mr-2 text-accent" />
                        <span className="text-highlight text-sm">{talent.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-5 border-t border-gray-700">
                  <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3">주요 프로젝트</h4>
                  <ul className="space-y-3">
                    {talent.keyProjects.map((project, idx) => (
                      <li key={idx} className="flex items-start bg-background-dark/30 p-3 rounded-md">
                        <FolderIcon className="h-5 w-5 mr-3 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-white">{project.name}</div>
                          <p className="text-highlight text-sm mt-1">{project.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-5 pt-5 border-t border-gray-700 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAvailabilityBadge(talent.availability)}`}>
                      {getAvailabilityText(talent.availability)}
                    </span>
                  </div>
                  <div className="flex">
                    <button className="btn-primary mr-3">
                      <ChatIcon className="h-4 w-4 mr-2" />
                      연락하기
                    </button>
                    <button className="btn-secondary">
                      <StarIcon className="h-4 w-4 mr-2" />
                      관심 등록
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 