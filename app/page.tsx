'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, BellIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
      {/* ▣ 메인 콘텐츠 */}
      <main className="flex-1 pt-20 md:pt-24">
        {/* 1) 히어로 섹션 */}
        <section className="relative isolate bg-gradient-to-r from-green-400 to-blue-800">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:flex-row md:items-center md:px-6 lg:py-20">
            {/* 왼쪽 텍스트 */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="max-w-xl text-left"
            >
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Reliable.
                <br />
                Guaranteed.
                <br />
                Secure.
              </h1>

              <h2 className="mt-8 text-4xl font-bold tracking-tight text-purple-300 md:text-5xl">
                Chainee.
              </h2>
            </motion.div>

            {/* 오른쪽 카드 (이미지 + 버튼) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="ml-auto w-full max-w-sm"
            >
              <div className="rounded-2xl bg-background/80 p-6 shadow-xl shadow-black/30 backdrop-blur">
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src="/images/hero-shield-key.png" // 3D 방패+키 이미지
                    alt="Secure wallet"
                    width={220}
                    height={220}
                    className="block mix-blend-screen brightness-110 contrast-110 select-none pointer-events-none"
                    priority
                  />

                  <Link href="/auth/signin" className="w-full">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full rounded-full bg-web3-mint py-3 text-center text-lg font-bold text-black shadow-lg transition hover:bg-web3-mintDark"
                    >
                      Sign in
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2) 중앙 서치바 섹션 */}
        <section className="mx-auto mt-10 max-w-6xl px-4 md:px-6">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative mx-auto max-w-3xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-6 top-3.5 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search new projects for you"
                className="w-full rounded-full bg-black/50 py-4 pl-14 pr-4 text-lg text-white placeholder-gray-400 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </motion.div>
        </section>

        {/* 3) 기능 섹션들 */}
        <section className="mx-auto mt-16 flex max-w-6xl flex-col gap-16 px-4 pb-20 md:px-6">
          {/* 카드 1 */}
          <motion.div
            className="flex flex-col items-center gap-10 md:flex-row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="w-full max-w-md">
              <Image
                src="/images/feature-trust.png"
                alt="Trust with technology"
                width={500}
                height={320}
                className="h-auto w-full rounded-3xl object-cover"
              />
            </div>
            <div className="w-full max-w-md text-center md:text-left">
              <p className="text-xl font-semibold leading-relaxed">
                <span className="text-web3-mint">기술로 신뢰를 만들고,</span>
                <br />
                <span className="text-web3-green">공정한 가치를 누리세요.</span>
              </p>
            </div>
          </motion.div>

          {/* 카드 2: DID 인증 */}
          <motion.div
            className="flex flex-col items-center gap-10 md:flex-row-reverse"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="w-full max-w-md">
              <Image
                src="/images/feature-did.png"
                alt="DID verification"
                width={500}
                height={320}
                className="h-auto w-full rounded-3xl object-cover"
              />
            </div>
            <div className="w-full max-w-md text-center md:text-left">
              <h3 className="text-2xl font-bold">DID 인증</h3>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                익명성과 신뢰를 동시에,
                <br />
                위변조 불가능한 신원 인증
              </p>
            </div>
          </motion.div>

          {/* 카드 3: 스마트 계약 협업 시스템 */}
          <motion.div
            className="flex flex-col items-center gap-10 md:flex-row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="w-full max-w-md">
              <Image
                src="/images/feature-contract.png"
                alt="Smart contract collaboration"
                width={500}
                height={320}
                className="h-auto w-full rounded-3xl object-cover"
              />
            </div>
            <div className="w-full max-w-md text-center md:text-left">
              <h3 className="text-2xl font-bold">스마트 계약 협업 시스템</h3>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                작업 시작과 동시에 예치,
                <br />
                완료에 따라 자동 분배
              </p>
            </div>
          </motion.div>

          {/* 카드 4: NFT 평판 시스템 */}
          <motion.div
            className="flex flex-col items-center gap-10 md:flex-row-reverse"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="w-full max-w-md">
              <Image
                src="/images/feature-nft.png"
                alt="NFT reputation system"
                width={500}
                height={320}
                className="h-auto w-full rounded-3xl object-cover"
              />
            </div>
            <div className="w-full max-w-md text-center md:text-left">
              <h3 className="text-2xl font-bold">NFT 평판 시스템</h3>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                완료된 성과를 NFT로 기록하여
                <br />
                신뢰 자산으로 축적
              </p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
