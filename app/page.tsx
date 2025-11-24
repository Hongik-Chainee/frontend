'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import FeatureSection from '@/components/landing/FeatureSection';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      {/* 상단 영역: 배경은 여기! (isolate로 동일 페인팅 컨텍스트 보장) */}
      <section className="relative isolate pt-20 pb-20 px-8 md:px-20 lg:px-40 xl:px-80 bg-gradient-to-r from-green-400 to-blue-800">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* 왼쪽 텍스트만 motion 처리 */}
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Reliable.
              <br />
              Guaranteed.
              <br />
              Secure.
            </h1>

            <h2 className="mt-10 text-4xl md:text-5xl font-bold tracking-tight text-purple-300">
              Chaniee.
            </h2>
          </motion.div>

          {/* 오른쪽: 이미지(배경X) + 버튼 */}
          <div className="relative">
            {/* 섞일 대상: 페이지 섹션 배경 */}
            <Image
              src="/images/keys.png"
              alt="Wallet icon"
              width={220}
              height={220}
              // 실제 img 요소에 블렌드가 적용되어야 함
              className="block mix-blend-screen brightness-110 contrast-110 select-none pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
              priority
            />

            <Link href="/auth/walletguide">
              <motion.button
                className="bg-web3-mint hover:bg-web3-mintDark text-black font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Wallet guide test
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* 중앙 영역 - 서치바 */}
      <main className="flex flex-col justify-start flex-1 px-4 w-full pt-10">
        <motion.div
          className="w-full max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search new projects for you"
              className="w-full bg-gray-800/50 text-white rounded-full py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </motion.div>
      </main>

      {/* 기능 소개 섹션 */}
      <FeatureSection />
    </div>
  );
}
