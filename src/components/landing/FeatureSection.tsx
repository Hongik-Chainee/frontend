'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function FeatureSection() {
    return (
        <div className="w-full">
            {/* 1. 신뢰 섹션 (헤더) */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="w-full bg-gradient-to-b from-black via-purple-950/20 to-black py-20 px-6"
            >
                <div className="max-w-7xl mx-auto text-center space-y-6">
                    <div className="relative w-32 h-32 mx-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.6)]">
                        <Image
                            src="/images/feature-trust.png"
                            alt="Trust Shield"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
                        <span className="text-purple-400">기술</span>로 <span className="text-green-400">신뢰</span>를 만들고,<br />
                        <span className="text-green-400">공정한 가치</span>를 누리세요.
                    </h2>
                </div>
            </motion.section>

            {/* 2. DID 인증 - 초록 그라디언트 배경 */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="relative w-full bg-gradient-to-r from-green-900/40 via-green-800/30 to-black py-20 px-6 overflow-hidden"
            >
                {/* 배경 블러 효과 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-40 blur-[120px] pointer-events-none">
                    <Image src="/images/feature-did.png" fill className="object-contain" alt="" />
                </div>

                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-20">
                    {/* 이미지 */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 drop-shadow-2xl">
                        <Image src="/images/feature-did.png" fill className="object-contain" alt="DID 인증" />
                    </div>

                    {/* 텍스트 */}
                    <div className="text-center md:text-left space-y-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-purple-300">DID 인증</h3>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                            익명성과 신뢰를 동시에,<br />
                            위변조 불가능한 신원 인증
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* 3. 스마트 계약 - 보라 그라디언트 배경 */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="relative w-full bg-gradient-to-l from-purple-900/40 via-purple-800/30 to-black py-20 px-6 overflow-hidden"
            >
                {/* 배경 블러 효과 */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-40 blur-[120px] pointer-events-none">
                    <Image src="/images/feature-contract.png" fill className="object-contain" alt="" />
                </div>

                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-10 md:gap-20">
                    {/* 이미지 */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 drop-shadow-2xl">
                        <Image src="/images/feature-contract.png" fill className="object-contain" alt="스마트 계약" />
                    </div>

                    {/* 텍스트 */}
                    <div className="text-center md:text-right space-y-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-green-400">스마트 계약 협업 시스템</h3>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                            작업 시작과 동시에 예치,<br />
                            완료에 따라 자동 분배
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* 4. NFT 평판 - 초록 그라디언트 배경 */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="relative w-full bg-gradient-to-r from-green-900/40 via-green-800/30 to-black py-20 px-6 overflow-hidden"
            >
                {/* 배경 블러 효과 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-40 blur-[120px] pointer-events-none">
                    <Image src="/images/feature-nft.png" fill className="object-contain" alt="" />
                </div>

                <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-20">
                    {/* 이미지 */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0 drop-shadow-2xl">
                        <Image src="/images/feature-nft.png" fill className="object-contain" alt="NFT 평판" />
                    </div>

                    {/* 텍스트 */}
                    <div className="text-center md:text-left space-y-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-purple-300">NFT 평판 시스템</h3>
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                            완료된 성과를 NFT로 기록하여<br />
                            신뢰 자산으로 축적
                        </p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
