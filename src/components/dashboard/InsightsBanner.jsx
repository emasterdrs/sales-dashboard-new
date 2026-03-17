import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, FileDown, Lock } from 'lucide-react';

export function InsightsBanner({ 
    summary, 
    drillDownData, 
    currentTime, 
    userPlan, 
    onUpgradeClick, 
    onOpenAIModal, 
    onExportExcel,
    fPercent
}) {
    const best = useMemo(() => {
        return [...drillDownData].sort((a, b) => b.achievement - a.achievement)[0];
    }, [drillDownData]);

    const achievementStatus = useMemo(() => {
        if (summary.achievementRate >= 100) return '목표 초과 달성! 🚀 비즈니스가 매우 강력하게 확장되고 있습니다.';
        if (summary.achievementRate >= summary.progressRate) return '목표 진도율을 상회하며 순항 중입니다. 현재 페이스 유지가 중요합니다.';
        return '목표 진도율 대비 실적이 일부 미달입니다. AI가 분석한 결과 특정 품목의 공급망 확인이 권장됩니다.';
    }, [summary]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-indigo-500/20 dark:border-indigo-400/10 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-indigo-500/5 group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] pointer-events-none" />
            
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-500 dark:to-purple-600 shadow-lg flex items-center justify-center text-indigo-600 dark:text-white shrink-0 relative">
                <Sparkles size={32} className="animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-bounce" />
            </div>
            
            <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">Smart Insight AI</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{currentTime} Analysis</span>
                </div>
                
                <h4 className="text-[17px] font-black text-slate-800 dark:text-slate-100 mb-2">{achievementStatus}</h4>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {best && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                최고 성과 부문: <span className="text-slate-900 dark:text-emerald-400 font-black">{best.name}</span>
                            </p>
                        </div>
                    )}
                    <button 
                        onClick={() => userPlan === 'free' ? onUpgradeClick() : onOpenAIModal()}
                        className={`text-xs font-black transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm ${userPlan === 'free' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-white'}`}
                    >
                        {userPlan === 'free' ? <Lock size={14} /> : <BrainCircuit size={14} />}
                        AI 심층 리포트 {userPlan === 'free' && <span className="text-[8px] bg-indigo-500 text-white px-1 ml-1 rounded">PRO</span>}
                    </button>
                    <button 
                        onClick={() => userPlan === 'free' ? onUpgradeClick() : onExportExcel()}
                        className={`text-xs font-black transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm ${userPlan === 'free' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-white'}`}
                    >
                        {userPlan === 'free' ? <Lock size={14} /> : <FileDown size={14} />}
                        Excel 내보내기 {userPlan === 'free' && <span className="text-[8px] bg-indigo-500 text-white px-1 ml-1 rounded">PRO</span>}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end justify-center px-6 md:border-l border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Efficency</p>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-500 tracking-tighter">
                    {fPercent(summary.achievementRate)}
                </span>
            </div>
        </motion.div>
    );
}
