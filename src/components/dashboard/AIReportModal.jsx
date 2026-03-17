import { motion } from 'framer-motion';
import { BrainCircuit, X, Sparkles, TrendingUp, Activity, ArrowUpRight, Lightbulb, Lock } from 'lucide-react';

export function AIReportModal({ isOpen, onClose, isAnalyzing, onUpgradeClick, userPlan = 'free' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
            >
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                            <BrainCircuit size={24} className={isAnalyzing ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">AI Intelligence Report</h2>
                            <p className="text-sm font-bold text-slate-400">데이터 기반 매출 실적 정밀 분석 및 전략 제안</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isAnalyzing ? (
                        <div className="h-full flex flex-col items-center justify-center py-20">
                            <Sparkles className="text-indigo-600 animate-pulse mb-4" size={48} />
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">데이터 패턴 분석 중...</h3>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InsightCard title="성장 동력 포착" icon={TrendingUp} color="emerald" detail="현재 매출의 24.5%가 특정 신규 품목에서 발생하고 있습니다." />
                                <InsightCard title="리스크 탐지" icon={Activity} color="rose" detail="영업 3팀의 특정 지역 실적이 목표 대비 15% 미달되었습니다." />
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-black flex items-center gap-3 italic"><Lightbulb size={24} className="text-amber-500" /> AI STRATEGIC ACTION PLAN</h3>
                                <div className="space-y-4">
                                    <ActionItem num={1} title="우량 거래처 집중 관리" desc="이탈 징후가 보이는 상위 5개 거래처에 본사 차원의 특별 프로모션 제안" />
                                    <ActionItem num={2} title="공급망 최적화" desc="품절 주기가 짧아지고 있는 품목 리스트를 생성하여 선제적 재고 확보 권고" />
                                </div>
                            </div>

                            {userPlan === 'free' && (
                                <div className="relative p-8 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
                                    <Lock size={32} className="mx-auto mb-4 opacity-50" />
                                    <h4 className="text-xl font-black mb-2 italic">상세 원인 심층 분석</h4>
                                    <p className="text-indigo-100 font-bold mb-6">AI Pro 플랜에서 사용 가능합니다.</p>
                                    <button onClick={onUpgradeClick} className="px-8 py-4 bg-white text-indigo-700 font-black rounded-2xl mx-auto flex items-center gap-2">
                                        <Sparkles size={18} /> PRO 플랜으로 업그레이드
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function InsightCard({ title, icon: Icon, color, detail }) {
    const colors = { emerald: 'bg-emerald-500/5 border-emerald-500/10 text-emerald-600 icon-bg-emerald-500', rose: 'bg-rose-500/5 border-rose-500/10 text-rose-500 icon-bg-rose-500' };
    return (
        <div className={`p-6 rounded-3xl border ${colors[color]}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl text-white ${color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'}`}><Icon size={20} /></div>
                <h4 className="font-extrabold">{title}</h4>
            </div>
            <p className="text-sm font-bold leading-relaxed mb-4 text-slate-600">{detail}</p>
        </div>
    );
}

function ActionItem({ num, title, desc }) {
    return (
        <div className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm shrink-0">{num}</div>
            <div>
                <h5 className="font-black text-slate-800 dark:text-slate-200 mb-1">{title}</h5>
                <p className="text-sm font-bold text-slate-500">{desc}</p>
            </div>
        </div>
    );
}
