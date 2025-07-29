'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// 더미 프로젝트 데이터
const projects = [
  {
    id: 1,
    title: '블록체인 기반 티켓팅 시스템 개발',
    company: '미래티켓(주)',
    description: '블록체인 기술을 활용한 위변조 방지 티켓팅 시스템을 개발하는 프로젝트입니다. 스마트 계약을 활용하여 2차 거래에 대한 수수료 분배 기능이 포함됩니다.',
    skills: ['Solidity', 'React', 'Node.js', 'Web3.js'],
    duration: '3개월',
    teamSize: 4,
    compensation: '5,000만원',
    deadline: '2023-05-15',
    status: 'active',
  },
  {
    id: 2,
    title: 'AI 기반 리스크 평가 시스템',
    company: '블록시큐리티',
    description: '블록체인 거래 내역을 분석하여 위험 요소를 예측하는 AI 기반 리스크 평가 시스템 개발 프로젝트입니다. 머신러닝 모델과 블록체인 데이터 연동이 핵심입니다.',
    skills: ['Python', 'TensorFlow', 'Blockchain API', 'Data Analysis'],
    duration: '6개월',
    teamSize: 5,
    compensation: '8,000만원',
    deadline: '2023-06-01',
    status: 'active',
  },
  {
    id: 3,
    title: 'DeFi 프로토콜 보안 감사',
    company: '디파이프로텍트',
    description: '새롭게 출시 예정인 DeFi 프로토콜의 스마트 계약 보안 감사를 수행하는 프로젝트입니다. 취약점 분석 및 개선 방안 제시가 주요 업무입니다.',
    skills: ['Solidity', 'Security Audit', 'Smart Contract', 'DeFi'],
    duration: '1개월',
    teamSize: 2,
    compensation: '3,500만원',
    deadline: '2023-04-30',
    status: 'urgent',
  },
  {
    id: 4,
    title: 'NFT 마켓플레이스 프론트엔드 개발',
    company: '아트블록',
    description: '디지털 아트 작품을 거래하는 NFT 마켓플레이스의 프론트엔드 개발 프로젝트입니다. 사용자 경험에 중점을 둔 인터페이스 구현이 필요합니다.',
    skills: ['React', 'TypeScript', 'Web3.js', 'UI/UX'],
    duration: '2개월',
    teamSize: 3,
    compensation: '4,000만원',
    deadline: '2023-05-20',
    status: 'active',
  },
  {
    id: 5,
    title: '양자내성 암호화(PQC) 기반 블록체인 시스템 설계',
    company: '퀀텀블록',
    description: '미래 양자컴퓨터 공격에 대비한 양자내성 암호화 기술을 블록체인에 적용하는 연구 및 개발 프로젝트입니다. Dilithium과 Falcon 알고리즘 구현이 포함됩니다.',
    skills: ['Cryptography', 'PQC', 'C++', 'Blockchain'],
    duration: '12개월',
    teamSize: 6,
    compensation: '1억 5천만원',
    deadline: '2023-06-15',
    status: 'featured',
  },
  {
    id: 6,
    title: '분산형 신원인증(DID) 모바일 앱 개발',
    company: '아이디체인',
    description: '블록체인 기반 분산형 신원인증 시스템을 모바일 앱으로 구현하는 프로젝트입니다. 사용자 데이터를 개인 단말에 저장하는 방식으로 개인정보 보호를 강화합니다.',
    skills: ['React Native', 'DID', 'Mobile Development', 'Blockchain'],
    duration: '4개월',
    teamSize: 3,
    compensation: '6,000만원',
    deadline: '2023-05-30',
    status: 'active',
  },
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    duration: '',
    compensation: '',
    status: '',
  });
  
  // 검색어 필터링
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 프로젝트 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'featured':
        return 'bg-primary-light text-primary';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // 프로젝트 상태 텍스트
  const getStatusText = (status: string) => {
    switch(status) {
      case 'urgent':
        return '긴급';
      case 'featured':
        return '주목할 만한';
      default:
        return '활성';
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-secondary">프로젝트</h1>
            <p className="mt-2 text-base text-secondary-light">
              지금 참여할 수 있는 블록체인 관련 프로젝트 목록입니다. 관심 있는 프로젝트에 지원해보세요.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              className="btn-primary"
            >
              프로젝트 등록하기
            </button>
          </div>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-light" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="input-field pl-10"
              placeholder="프로젝트, 기술 스택, 회사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-background-card px-4 py-2 text-sm font-medium text-secondary-light shadow-sm hover:bg-gray-100"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              필터
            </button>
          </div>
        </div>

        {/* 프로젝트 목록 */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="card group hover:-translate-y-1 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary group-hover:text-primary">
                          <Link href={`/projects/${project.id}`}>{project.title}</Link>
                        </h3>
                        <p className="text-sm text-secondary-light">{project.company}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-secondary-light line-clamp-2">{project.description}</p>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-medium text-secondary-light"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-secondary-light">
                        <ClockIcon className="h-4 w-4 mr-1.5" />
                        {project.duration}
                      </div>
                      <div className="flex items-center text-secondary-light">
                        <UsersIcon className="h-4 w-4 mr-1.5" />
                        {project.teamSize}명
                      </div>
                      <div className="flex items-center text-secondary-light">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />
                        {project.compensation}
                      </div>
                      <div className="flex items-center text-secondary-light">
                        <TagIcon className="h-4 w-4 mr-1.5" />
                        {new Date(project.deadline) < new Date() ? '마감됨' : '진행중'}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="text-primary hover:text-primary-dark text-sm font-medium flex items-center"
                      >
                        자세히 보기
                        <span aria-hidden="true" className="ml-1">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 