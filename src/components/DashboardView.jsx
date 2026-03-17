import React, { useMemo, useState } from 'react';
import {
    DollarSign, Target, TrendingUp, Zap, Calendar, ChevronLeft, ChevronRight,
    Activity, ChevronDown, PieChart as PieChartIcon, Info, Sparkles,
    Activity as ActivityIcon, TrendingUp as TrendingUpIcon, 
    ChevronRight as ChevronRightIcon, BrainCircuit, Lock, FileDown
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, ReferenceLine, LabelList, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { TodoWidget } from './TodoWidget';
import { convertToCSV, downloadCSV } from '../data/generateSalesData';
import { StatCard } from './dashboard/StatCard';
import { InsightsBanner } from './dashboard/InsightsBanner';
import { AIReportModal } from './dashboard/AIReportModal';
import { TEAM_COLORS, CHART_COLORS, CURRENCY_UNITS, WEIGHT_UNITS } from '../constants/appConstants';

export function DashboardView({
    summary, drillDownData, slicedChartData, selectedMonth, setSelectedMonth,
    currentTime, bizDayInfo, mainTab, setMainTab, analysisMode, setAnalysisMode,
    path, setPath, metricType, setMetricType, amountUnit, setAmountUnit,
    weightUnit, setWeightUnit, fMetric, fPercent, fCurrencyNoSuffix,
    handleDrillDown, view, isDarkMode, userPlan = 'free', onUpgradeClick
}) {
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const isRestrictedMonth = useMemo(() => {
        if (userPlan !== 'free') return false;
        const now = new Date();
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const selectedDate = new Date(selectedMonth + '-01');
        return selectedDate < cutoffDate;
    }, [userPlan, selectedMonth]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {isRestrictedMonth && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-[24px] p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg"><Info size={20} /></div>
                        <div>
                            <p className="text-sm font-black text-amber-800">데이터 열람 제한 안내</p>
                            <p className="text-xs font-bold text-amber-600/80">FREE 플랜은 최근 3개월 데이터만 조회 가능합니다.</p>
                        </div>
                    </div>
                    <button onClick={onUpgradeClick} className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl">업그레이드</button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="전체 매출 실적" value={fMetric(summary.actual)} detail={`목표금액: ${fMetric(summary.target)}`} icon={DollarSign} color="indigo" trend={summary.achievementRate} />
                <StatCard title="달성률 (목표대비)" value={fPercent(summary.achievementRate)} detail={`진도율(${fPercent(summary.progressRate)}) 대비 ${summary.progressGap >= 0 ? '+' : ''}${summary.progressGap.toFixed(1)}%`} icon={Target} color="emerald" />
                <StatCard title="전년 동기 대비(YoY)" value={fPercent(summary.yoyGrowth)} detail={`전년 실적: ${fMetric(summary.lastYearActual)}`} icon={TrendingUp} color="amber" trend={summary.yoyGrowth} />
                <StatCard title="예상 마감 실적" value={userPlan === 'free' ? 'LOCKED' : fMetric(summary.forecast)} detail={userPlan === 'free' ? 'PRO 전용 기능' : '현재 추세 기반 월말 예상치'} icon={userPlan === 'free' ? Lock : Zap} color={userPlan === 'free' ? 'slate' : 'violet'} trend={userPlan === 'free' ? undefined : summary.cumulativeAchievement} />
            </div>

            <InsightsBanner 
                summary={summary} drillDownData={drillDownData} currentTime={currentTime} userPlan={userPlan} 
                onUpgradeClick={onUpgradeClick} onOpenAIModal={() => { setIsAIModalOpen(true); setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} 
                onExportExcel={() => { /* Export logic */ }} fPercent={fPercent} 
            />

            <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-3 px-5 rounded-3xl border border-slate-200">
                    <Calendar size={20} className="text-indigo-500" />
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent font-black outline-none cursor-pointer">
                        {[2026, 2025, 2024].map(y => (
                            <optgroup key={y} label={`${y}년`}>
                                {Array.from({ length: 12 }, (_, i) => String(12 - i).padStart(2, '0')).map(m => <option key={`${y}-${m}`} value={`${y}-${m}`}>{`${y}년 ${m}월`}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                    {['goal', 'yoy', 'mom', 'cumulative'].map(mode => (
                        <button key={mode} onClick={() => setAnalysisMode(mode)} className={`px-4 py-2 rounded-xl text-xs font-black ${analysisMode === mode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{mode.toUpperCase()}</button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><ActivityIcon size={18} /> 실적 분석</h3>
                        <div className="flex gap-2">
                            <select value={metricType} onChange={e => setMetricType(e.target.value)} className="text-xs font-bold border rounded p-1 outline-none">
                                <option value="amount">금액</option>
                                <option value="weight">중량</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b">
                                <tr className="text-[12px] font-black uppercase text-slate-400">
                                    <th className="py-4 px-6">구분</th>
                                    <th className="py-4 px-2 text-right">목표</th>
                                    <th className="py-4 px-2 text-right">실적</th>
                                    <th className="py-4 px-6 text-center">달성률</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {drillDownData.map((item, i) => (
                                    <tr key={i} onClick={() => handleDrillDown(item)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                                        <td className="py-4 px-6 font-black flex items-center gap-3">
                                            <div className="w-2 h-4 rounded-full" style={{ background: TEAM_COLORS[item.name]?.main || CHART_COLORS[i % CHART_COLORS.length] }} />
                                            {item.name}
                                        </td>
                                        <td className="py-4 px-2 text-right font-mono font-bold text-slate-500">{fCurrencyNoSuffix(item.target || item.cumulativeTarget)}</td>
                                        <td className="py-4 px-2 text-right font-mono font-black">{fCurrencyNoSuffix(item.actual || item.cumulativeActual)}</td>
                                        <td className="py-4 px-6 text-center font-black text-indigo-600">{fPercent(item.achievement || item.cumulativeAchievement)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 p-6 flex flex-col h-fit">
                    <h3 className="font-black uppercase text-slate-800 mb-6 flex items-center gap-2"><TrendingUpIcon size={18} /> 달성률 시각화</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={slicedChartData} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip />
                                <Bar dataKey="achievement" radius={[4, 4, 0, 0]} barSize={30}>
                                    {slicedChartData.map((e, i) => <Cell key={i} fill={TEAM_COLORS[e.name]?.main || CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 p-8 h-fit">
                <h3 className="font-black uppercase text-slate-800 mb-6 flex items-center gap-2"><PieChartIcon size={18} /> 구성비 분석</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={slicedChartData.filter(d => d.actual > 0)} dataKey="actual" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                                {slicedChartData.filter(d => d.actual > 0).map((e, i) => <Cell key={i} fill={TEAM_COLORS[e.name]?.main || CHART_COLORS[i % CHART_COLORS.length]} />)}
                                <LabelList dataKey="name" position="outside" offset={10} fontSize={10} fontWeight="bold" />
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <TodoWidget profile={profile} />

            <AIReportModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} isAnalyzing={isAnalyzing} onUpgradeClick={onUpgradeClick} userPlan={userPlan} />
        </div>
    );
}
