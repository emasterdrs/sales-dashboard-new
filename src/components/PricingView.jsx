import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Crown, CreditCard, Sparkles } from 'lucide-react';

export function PricingView({ onUpgrade, onInquiry, currentPlan = 'free' }) {
    const plans = [
        {
            id: 'free',
            name: 'Free Starter',
            price: '₩0',
            desc: '개인 및 소규모 팀을 위한 기본 대시보드',
            features: [
                '기본 매출 데이터 시각화',
                '팀별/유형별 필터링',
                '엑셀 데이터 업로드 지원',
                '최근 3개월 데이터 조회'
            ],
            cta: '현재 사용 중',
            highlight: false,
            color: 'slate'
        },
        {
            id: 'pro',
            name: 'AI Pro',
            price: '₩29,000',
            suffix: '/월',
            desc: 'AI 분석과 스마트 인사이트로 매출 가속화',
            features: [
                'Free 플랜의 모든 기능',
                'Smart Insight AI 분석 리포트',
                '실시간 성과 예측 (Forecast)',
                '전년 동기 대비 AI 심층 분석',
                '데이터 무제한 조회 및 보관'
            ],
            cta: '지금 시작하기',
            highlight: true,
            color: 'indigo'
        },
        {
            id: 'ultra',
            name: 'ULTRA',
            price: '별도 문의',
            desc: '제한 없는 최상위 AI 분석 솔루션',
            features: [
                'Pro 플랜의 모든 기능',
                '커스텀 데이터 API 연동',
                '전담 계정 매니저 배정',
                '보안 및 규정 준수 커스텀',
                '조직 내 무제한 멤버 추가'
            ],
            cta: '문의하기',
            highlight: false,
            color: 'purple'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <header className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-full text-[12px] font-black uppercase tracking-widest mb-4 border border-indigo-500/20"
                >
                    Plans & Pricing
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                    비즈니스 성장을 위한 <span className="text-indigo-600 italic">스마트한 선택</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">
                    데이터 분석 전문가가 없어도 AI가 모든 인사이트를 찾아드립니다.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative p-8 rounded-[32px] border transition-all duration-300 flex flex-col ${
                            plan.highlight 
                            ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/10 scale-105 z-10' 
                            : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 shadow-sm'
                        }`}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black rounded-full shadow-lg flex items-center gap-1.5">
                                <Sparkles size={12} /> MOST POPULAR
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                                {plan.suffix && <span className="text-slate-400 font-bold">{plan.suffix}</span>}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-bold leading-relaxed">{plan.desc}</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => {
                                if (plan.id === 'ultra') onInquiry();
                                else onUpgrade(plan);
                            }}
                            disabled={plan.id === currentPlan}
                            className={`w-full py-4 rounded-2xl text-sm font-black transition-all ${
                                plan.id === currentPlan
                                ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-default'
                                : plan.highlight
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.02]'
                                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02]'
                            }`}
                        >
                            {plan.id === currentPlan ? '현재 사용 중' : plan.cta}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-20 p-10 bg-slate-900 rounded-[40px] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full -mr-48 -mt-48 transition-all group-hover:bg-indigo-500/30" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
                            <Zap size={28} className="text-amber-400 fill-amber-400" />
                            AI 파트너와 함께 매출을 극대화하세요
                        </h3>
                        <p className="text-slate-400 font-bold leading-relaxed max-w-xl">
                            이미 500개 이상의 유통/세일즈 팀이 AI 대시보드를 통해 업무 효율을 3배 이상 높였습니다.<br/>
                            지금 바로 시작하고 첫 분석 리포트를 받아보세요.
                        </p>
                    </div>
                    <button 
                        onClick={() => onUpgrade(plans.find(p => p.id === 'pro'))}
                        className="px-10 py-5 bg-white text-slate-950 font-black rounded-3xl hover:bg-indigo-50 transition-all shadow-2xl flex items-center gap-3 active:scale-95 shrink-0"
                    >
                        <CreditCard size={20} /> 프로 플랜 구독하기
                    </button>
                </div>
            </div>
            
            <div className="mt-12 text-center text-slate-400 text-sm font-bold">
                결제 및 요금 관련 문의: support@emasterdrs.ai
            </div>
        </div>
    );
}
