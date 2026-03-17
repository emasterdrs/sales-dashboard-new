import React from 'react';
import { motion } from 'framer-motion';
import { 
    Book, 
    Zap, 
    Shield, 
    Crown, 
    LayoutDashboard, 
    BarChart3, 
    Settings, 
    Mail,
    ArrowRight,
    Star,
    CheckCircle2,
    FileSearch,
    BrainCircuit,
    Database,
    Lock
} from 'lucide-react';

export function ManualView({ profile, onBack }) {
    const plan = profile?.plan || 'free';
    const isSuperAdmin = profile?.role === 'super_admin';

    const manuals = {
        free: {
            title: 'Free 플랜 시작하기',
            badge: 'Basic',
            color: 'slate',
            icon: Shield,
            steps: [
                {
                    title: '기본 매출 시각화',
                    desc: '업로드된 데이터를 바탕으로 실시간 매출 현황을 시각화하여 보여줍니다. 전체 매출과 목표 달성률을 한눈에 확인하세요.',
                    icon: LayoutDashboard
                },
                {
                    title: '최근 3개월 데이터 조회',
                    desc: 'Free 플랜은 최근 3개월간의 데이터 트렌드 분석을 지원합니다. 과거 데이터 조회가 더 필요한 경우 PRO 플랜으로 업그레이드하세요.',
                    icon: BarChart3
                },
                {
                    title: '간편 엑셀 업로드',
                    desc: '정해진 양식의 엑셀 파일을 업로드하여 데이터를 동기화할 수 있습니다. 한 번에 최대 100행까지 지원됩니다.',
                    icon: Database
                }
            ]
        },
        pro: {
            title: 'AI Pro 가이드',
            badge: 'Advanced',
            color: 'indigo',
            icon: Zap,
            steps: [
                {
                    title: 'Smart Insight AI 분석',
                    desc: '대시보드 상단의 Smart Insight 버튼을 눌러 AI가 분석한 심층 원인 분석 리포트를 확인하세요. 매출 과부족의 핵심 원인을 짚어줍니다.',
                    icon: BrainCircuit
                },
                {
                    title: '실시간 성과 예측 (Forecast)',
                    desc: '현재 추세를 바탕으로 월말 또는 연말 최종 매출을 인공지능이 예측합니다. 목표 달성을 위한 선제적 대응이 가능해집니다.',
                    icon: Star
                },
                {
                    title: '데이터 무제한 분석',
                    desc: '기간 제한 없이 모든 과거 데이터를 조회하고 분석할 수 있으며, 분석된 결과는 엑셀(CSV)로 자유롭게 내보낼 수 있습니다.',
                    icon: FileSearch
                }
            ]
        },
        ultra: {
            title: 'ULTRA 솔루션',
            badge: 'Ultra AI',
            color: 'purple',
            icon: Crown,
            steps: [
                {
                    title: '커스텀 데이터 API 연동',
                    desc: 'ERP나 사내 DB와 API로 직접 연동하여 엑셀 업로드 없이도 실시간으로 데이터를 동기화할 수 있습니다.',
                    icon: Database
                },
                {
                    title: '전담 계정 매니저 서비스',
                    desc: '울트라 고객사 전용 전속 매니저가 배정되어 대시보드 커스터마이징 및 데이터 분석 컨설팅을 지원합니다.',
                    icon: Mail
                },
                {
                    title: '고급 보안 정책 설정',
                    desc: '회사별 보안 규정에 맞춘 화이트리스트 IP 설정, 2단계 인증 등 강력한 보안 옵션을 제공합니다.',
                    icon: Lock
                }
            ]
        },
        admin: {
            title: '슈퍼관리자 운영 매뉴얼',
            badge: 'System Admin',
            color: 'rose',
            icon: Shield,
            steps: [
                {
                    title: '문의 게시판 관리',
                    desc: '전체 사용자들이 남긴 1:1 문의 사항을 실시간으로 확인하고 직접 답변을 작성하여 소통할 수 있습니다.',
                    icon: Mail
                },
                {
                    title: '사용자 플랜 및 권한 제어',
                    desc: '시스템에 가입된 각 기업과 사용자의 플랜(Free, Pro, Ultra)을 변경하고 접근 권한을 관리합니다.',
                    icon: Settings
                },
                {
                    title: '시스템 리소스 모니터링',
                    desc: 'DB 사용량, API 호출 빈도 등 시스템의 전반적인 상태를 모니터링하여 안정적인 서비스를 유지합니다.',
                    icon: BarChart3
                }
            ]
        }
    };

    const currentManual = isSuperAdmin ? manuals.admin : manuals[plan] || manuals.free;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500 py-6">
            <div className="text-center space-y-4">
                <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`inline-block px-4 py-1.5 bg-${currentManual.color}-500/10 text-${currentManual.color}-600 dark:text-${currentManual.color}-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-${currentManual.color}-500/20`}
                >
                    {currentManual.badge} Guide
                </motion.div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center justify-center gap-4">
                    <Book size={32} className={`text-${currentManual.color}-500`} />
                    {currentManual.title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto">
                    {currentManual.title}을 효과적으로 사용하기 위한 핵심 기능을 안내해 드립니다.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {currentManual.steps.map((step, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[40px] shadow-sm hover:shadow-xl transition-all group flex items-start gap-8"
                    >
                        <div className={`p-5 bg-${currentManual.color}-500/10 text-${currentManual.color}-600 rounded-[28px] group-hover:scale-110 transition-transform`}>
                            <step.icon size={28} />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                {idx + 1}. {step.title}
                                <CheckCircle2 size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center text-slate-200 dark:text-white/5">
                            <ArrowRight size={40} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 bg-slate-900 rounded-[40px] border border-white/5 relative overflow-hidden text-center space-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                <h3 className="text-white font-black text-xl relative z-10 italic">더 궁금한 점이 있으신가요?</h3>
                <p className="text-slate-400 font-bold relative z-10">매뉴얼에 없는 상세한 도움이 필요하시면 문의 게시판을 이용해 주세요.</p>
                <div className="flex justify-center gap-4 relative z-10">
                    <button 
                        onClick={onBack}
                        className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 transition-all shadow-xl"
                    >
                        메인화면으로
                    </button>
                </div>
            </div>
        </div>
    );
}

