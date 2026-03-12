import React, { useMemo } from 'react';
import {
    DollarSign, Target, TrendingUp, Zap, Calendar, ChevronLeft, ChevronRight,
    Activity, ChevronDown, PieChart as PieChartIcon, Info, Sparkles
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, ReferenceLine, LabelList, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { TodoWidget } from './TodoWidget';

export function DashboardView({
    summary,
    drillDownData,
    slicedChartData,
    selectedMonth,
    setSelectedMonth,
    currentTime,
    bizDayInfo,
    mainTab,
    setMainTab,
    analysisMode,
    setAnalysisMode,
    path,
    setPath,
    metricType,
    setMetricType,
    amountUnit,
    setAmountUnit,
    weightUnit,
    setWeightUnit,
    CURRENCY_UNITS,
    WEIGHT_UNITS,
    TEAM_COLORS,
    CHART_COLORS,
    fMetric,
    fPercent,
    fCurrencyNoSuffix,
    handleDrillDown,
    view,
    isDarkMode
}) {

    function CompactStat({ title, value, detail, icon: Icon, color, trend }) {
        const isPositive = trend >= 0;
        const colorMap = {
            indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
            rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
            amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
            slate: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400',
            violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
            blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
        };

        return (
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group">
                <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.slate} transition-all group-hover:scale-110 duration-300 shadow-sm`}>
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-tight">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
                        {trend !== undefined && (
                            <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? '↑' : '↓'}{(Math.abs(trend) || 0).toFixed(1)}%
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-0.5 font-bold">{detail}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                <CompactStat
                    title="전체 매출 실적"
                    value={fMetric(summary.actual)}
                    detail={`목표금액: ${fMetric(summary.target)}`}
                    icon={DollarSign}
                    color="indigo"
                    trend={summary.achievementRate}
                />
                <CompactStat
                    title="달성률 (목표대비)"
                    value={fPercent(summary.achievementRate)}
                    detail={`진도율(${fPercent(summary.progressRate)}) 대비 ${summary.progressGap >= 0 ? '+' : ''}${summary.progressGap.toFixed(1)}%`}
                    icon={Target}
                    color="emerald"
                />
                <CompactStat
                    title="전년 동기 대비(YoY)"
                    value={fPercent(summary.yoyGrowth)}
                    detail={`전년 실적: ${fMetric(summary.lastYearActual)}`}
                    icon={TrendingUp}
                    color="amber"
                    trend={summary.yoyGrowth}
                />
                <CompactStat
                    title="예상 마감 실적"
                    value={fMetric(summary.forecast)}
                    detail={`현재 추세 기반 월말 예상치`}
                    icon={Zap}
                    color="violet"
                    trend={summary.cumulativeAchievement}
                />
            </div>

            {/* Quick Insights Banner */}
            {useMemo(() => {
                const sorted = [...drillDownData].sort((a, b) => b.achievement - a.achievement);
                const best = sorted[0];
                const achievementStatus = summary.achievementRate >= 100 ? '목표를 이미 달성했습니다! 🎉' :
                    summary.achievementRate >= summary.progressRate ? '목표 달성을 향해 안정적으로 순항 중입니다.' : 
                    '목표 진도율 대비 실적이 미달입니다. 점검이 필요합니다.';
                    
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-white/5 rounded-3xl p-6 flex items-center gap-6 shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-50 dark:border-white/5">
                            <Sparkles size={24} className="animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-1">Weekly Intelligence Insight</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                                    현재 <span className="text-indigo-600 dark:text-indigo-400 font-black">{achievementStatus}</span>
                                </p>
                                {best && (
                                    <div className="hidden md:block w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                                )}
                                {best && (
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                        최우수 성과: <span className="text-emerald-600 dark:text-emerald-400 font-black">{best.name}</span> ({fPercent(best.achievement)})
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            }, [drillDownData, summary])}

            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-6">
                <div className="flex flex-wrap items-center gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl p-3 px-5 rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 pr-4 border-r border-slate-100 dark:border-white/5">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner border border-indigo-100/50 dark:border-white/5">
                            <Calendar size={22} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5">Analysis Period</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => {
                                    const prev = new Date(selectedMonth + '-01');
                                    prev.setMonth(prev.getMonth() - 1);
                                    let y = prev.getFullYear();
                                    let m = String(prev.getMonth() + 1).padStart(2, '0');
                                    setSelectedMonth(`${y}-${m}`);
                                }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><ChevronLeft size={16} /></button>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-transparent dark:text-slate-100 text-[15px] font-black text-slate-800 outline-none cursor-pointer appearance-none py-0.5 px-1 hover:text-indigo-600 transition-colors"
                                >
                                    {[2026, 2025, 2024].map(year => (
                                        <optgroup key={year} label={`${year}년`} className="bg-white dark:bg-slate-900">
                                            {Array.from({ length: 12 }, (_, i) => 12 - i).map(month => {
                                                const mStr = String(month).padStart(2, '0');
                                                return <option key={`${year}-${mStr}`} value={`${year}-${mStr}`} className="bg-white dark:bg-slate-900">{`${year}년 ${mStr}월`}</option>;
                                            })}
                                        </optgroup>
                                    ))}
                                </select>
                                <button onClick={() => {
                                    const next = new Date(selectedMonth + '-01');
                                    next.setMonth(next.getMonth() + 1);
                                    let y = next.getFullYear();
                                    let m = String(next.getMonth() + 1).padStart(2, '0');
                                    setSelectedMonth(`${y}-${m}`);
                                }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Data Status</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 shadow-sm overflow-hidden animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Live DB Sync</span>
                            </div>
                        </div>
                        <p className="text-[13px] font-black text-slate-600 dark:text-slate-300 tracking-tight mt-0.5">{currentTime} 업데이트됨</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    <div className="flex items-center gap-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 px-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all hover:shadow-md">
                        <div className="flex-1 min-w-[140px] md:min-w-[180px]">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">영업 진도율</span>
                                <span className="text-[12px] font-black text-slate-700 dark:text-slate-300">{fPercent(summary.progressRate)}</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-600/50 p-[2px]">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-1000 ease-out"
                                    style={{ width: `${summary.progressRate}%` }}
                                />
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-700" />
                        <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl">
                            <button onClick={() => setMainTab('current')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mainTab === 'current' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>현재실적</button>
                            <button onClick={() => setMainTab('expected')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mainTab === 'expected' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>예상마감</button>
                        </div>
                    </div>

                    <div className="flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-2 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all hover:shadow-md">
                        <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl">
                            {[
                                { id: 'goal', name: '목표대비' },
                                { id: 'yoy', name: '전년대비' },
                                { id: 'mom', name: '전월대비' },
                                { id: 'cumulative', name: '누계' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setAnalysisMode(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all whitespace-nowrap ${analysisMode === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-4">
                    <div className="grid grid-cols-1 lg:grid-cols-5 items-start gap-8">
                        {/* Detailed Team Analysis Table (LEFT - 3/5) */}
                        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col max-h-[1000px]">
                            <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center whitespace-nowrap overflow-x-auto no-scrollbar">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-base font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2 shrink-0">
                                        <Activity size={18} className="text-indigo-500" />
                                        분석 현황
                                    </h3>
                                    {path.length > 1 && (
                                        <div className="flex items-center gap-0.5 px-2.5 py-1 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm overflow-hidden">
                                            {path.map((p, i) => (
                                                <button key={i} onClick={() => setPath(path.slice(0, i + 1))} className={`text-[10px] font-black px-1.5 py-0.5 transition-all flex items-center gap-1 rounded-md ${i === path.length - 1 ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700'}`}>
                                                    {p.name}
                                                    {i < path.length - 1 && <ChevronRight size={8} className={i === path.length - 1 ? 'text-white/50' : 'text-indigo-200 dark:text-indigo-600'} />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700 ml-4 shrink-0">
                                        <button onClick={() => setMetricType('amount')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${metricType === 'amount' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>금액</button>
                                        <button onClick={() => setMetricType('weight')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${metricType === 'weight' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}>중량</button>
                                    </div>
                                    <div className="relative shrink-0 ml-1">
                                        <select
                                            value={metricType === 'amount' ? amountUnit : weightUnit}
                                            onChange={(e) => {
                                                if (metricType === 'amount') setAmountUnit(e.target.value);
                                                else setWeightUnit(e.target.value);
                                            }}
                                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[13px] font-black py-1.5 pl-3 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
                                        >
                                            {metricType === 'amount' ? (
                                                CURRENCY_UNITS.map(u => <option key={u.key} value={u.key}>(단위: {u.label})</option>)
                                            ) : (
                                                WEIGHT_UNITS.map(u => <option key={u.key} value={u.key}>(단위: {u.label})</option>)
                                            )}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[800px] no-scrollbar">
                                <table className="w-full text-left table-fixed min-w-[650px]">
                                    <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md border-b-2 border-slate-200 dark:border-white/5">
                                        <tr className="text-slate-700 dark:text-slate-300 font-extrabold text-[13px] md:text-[14px] uppercase tracking-tighter align-middle">
                                            <th className="py-3.5 px-6 w-[20%] text-left">
                                                {path.length === 1 ? (view === 'dashboard_type' ? '유형명' : '영업팀') :
                                                    path.length === 2 ? '영업사원' :
                                                        path.length === 3 ? '거래처' : '품목'}
                                            </th>
                                            {analysisMode === 'goal' && (
                                                <>
                                                    <th className="py-3.5 px-2 text-right w-[15%]">목표</th>
                                                    <th className="py-3.5 px-2 text-right w-[15%]">실적</th>
                                                    <th className="py-3.5 px-2 text-center w-[15%]">달성율(%)</th>
                                                    <th className="py-3.5 px-2 text-center w-[15%]">과부족(%)</th>
                                                    <th className="py-3.5 pr-6 text-right w-[20%]">과부족({metricType === 'amount' ? '금액' : '수량'})</th>
                                                </>
                                            )}
                                            {analysisMode === 'yoy' && (
                                                <>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">실적</th>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">전년실적</th>
                                                    <th className="py-3.5 px-2 text-center w-[20%]">성장률(%)</th>
                                                    <th className="py-3.5 pr-6 text-right w-[20%]">증감액</th>
                                                </>
                                            )}
                                            {analysisMode === 'mom' && (
                                                <>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">실적</th>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">전월실적</th>
                                                    <th className="py-3.5 px-2 text-center w-[20%]">성장률(%)</th>
                                                    <th className="py-3.5 pr-6 text-right w-[20%]">증감액</th>
                                                </>
                                            )}
                                            {analysisMode === 'cumulative' && (
                                                <>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">누계목표</th>
                                                    <th className="py-3.5 px-2 text-right w-[20%]">누계실적</th>
                                                    <th className="py-3.5 px-2 text-center w-[20%]">달성율(%)</th>
                                                    <th className="py-3.5 pr-6 text-right w-[20%]">과부족</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {drillDownData.map((item, i) => (
                                            <tr key={i} onClick={() => handleDrillDown(item)} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group">
                                                <td className="py-4 px-6 font-black text-slate-800 dark:text-slate-200 text-[15px] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight truncate align-middle">
                                                    <span className="inline-block w-2 h-5 rounded-full mr-3 align-middle" style={{ background: TEAM_COLORS[item.name]?.main || CHART_COLORS[i % CHART_COLORS.length] }} />
                                                    {item.name}
                                                </td>
                                                {analysisMode === 'goal' && (
                                                    <>
                                                        <td className="py-4 px-2 font-mono text-slate-500 dark:text-slate-400 text-right text-[15px] font-bold align-middle">{fCurrencyNoSuffix(item.target)}</td>
                                                        <td className="py-4 px-2 font-mono text-slate-800 dark:text-slate-200 text-right text-[15px] font-extrabold align-middle">{fCurrencyNoSuffix(item.actual)}</td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px] block">{fPercent(item.achievement)}</span>
                                                        </td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <span className={`font-extrabold text-[15px] ${(item.progressGap || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                                {(item.progressGap || 0) > 0 ? '+' : ''}{(item.progressGap || 0).toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className={`py-4 pr-6 font-mono text-right font-extrabold text-[15px] align-middle ${item.overShort >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                            {item.overShort > 0 ? `+${fCurrencyNoSuffix(item.overShort)}` : fCurrencyNoSuffix(item.overShort)}
                                                        </td>
                                                    </>
                                                )}
                                                {/* (Other modes omitted for brevity, logic identical to previous code matching App.jsx content...) */}
                                                {analysisMode === 'yoy' && (
                                                    <>
                                                        <td className="py-4 px-2 font-mono text-slate-800 dark:text-slate-200 text-right text-[15px] font-extrabold align-middle">{fCurrencyNoSuffix(item.actual)}</td>
                                                        <td className="py-4 px-2 font-mono text-slate-500 dark:text-slate-400 text-right text-[15px] font-bold align-middle">{fCurrencyNoSuffix(item.lastYear)}</td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <span className={`font-extrabold text-[15px] ${item.yoy >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{fPercent(item.yoy)}</span>
                                                        </td>
                                                        <td className={`py-4 pr-6 font-mono text-right font-extrabold text-[15px] align-middle ${item.actual - item.lastYear >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                            {fCurrencyNoSuffix(item.actual - item.lastYear)}
                                                        </td>
                                                    </>
                                                )}
                                                {analysisMode === 'mom' && (
                                                    <>
                                                        <td className="py-4 px-2 font-mono text-slate-800 dark:text-slate-200 text-right text-[15px] font-extrabold align-middle">{fCurrencyNoSuffix(item.actual)}</td>
                                                        <td className="py-4 px-2 font-mono text-slate-500 dark:text-slate-400 text-right text-[15px] font-bold align-middle">{fCurrencyNoSuffix(item.lastMonth)}</td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <span className={`font-extrabold text-[15px] ${item.mom >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{fPercent(item.mom)}</span>
                                                        </td>
                                                        <td className={`py-4 pr-6 font-mono text-right font-extrabold text-[15px] align-middle ${item.actual - item.lastMonth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                            {fCurrencyNoSuffix(item.actual - item.lastMonth)}
                                                        </td>
                                                    </>
                                                )}
                                                {analysisMode === 'cumulative' && (
                                                    <>
                                                        <td className="py-4 px-2 font-mono text-slate-500 dark:text-slate-400 text-right text-[15px] font-bold align-middle">{fCurrencyNoSuffix(item.cumulativeTarget)}</td>
                                                        <td className="py-4 px-2 font-mono text-slate-800 dark:text-slate-200 text-right text-[15px] font-extrabold align-middle">{fCurrencyNoSuffix(item.cumulativeActual)}</td>
                                                        <td className="py-4 px-2 text-center align-middle">
                                                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[15px]">{fPercent(item.cumulativeAchievement)}</span>
                                                        </td>
                                                        <td className={`py-4 pr-6 font-mono text-right font-extrabold text-[15px] align-middle ${item.cumulativeActual - item.cumulativeTarget >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                            {fCurrencyNoSuffix(item.cumulativeActual - item.cumulativeTarget)}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/80 dark:bg-slate-900/80 border-t-2 border-slate-200 dark:border-slate-700">
                                        <tr className="font-extrabold text-[15px] md:text-[16px]">
                                            <td className="py-4 px-6 text-slate-900 dark:text-slate-100 uppercase tracking-tight align-middle">합계</td>
                                            {analysisMode === 'goal' && (
                                                <>
                                                    <td className="py-4 px-2 font-mono text-slate-600 dark:text-slate-400 text-right align-middle">{fCurrencyNoSuffix(summary.target)}</td>
                                                    <td className="py-4 px-2 font-mono text-slate-900 dark:text-slate-100 text-right align-middle">{fCurrencyNoSuffix(summary.actual)}</td>
                                                    <td className="py-4 px-2 text-center align-middle"><span className="text-slate-900 dark:text-slate-100 tracking-tighter">{fPercent(summary.achievementRate)}</span></td>
                                                    <td className="py-4 px-2 text-center align-middle">
                                                        <span className={`tracking-tighter ${(summary.progressGap || 0) >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                            {(summary.progressGap || 0) > 0 ? '+' : ''}{(summary.progressGap || 0).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className={`py-4 pr-6 font-mono text-right align-middle ${summary.overShort >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                        {summary.overShort > 0 ? `+${fCurrencyNoSuffix(summary.overShort)}` : fCurrencyNoSuffix(summary.overShort)}
                                                    </td>
                                                </>
                                            )}
                                            {analysisMode === 'yoy' && (
                                                <>
                                                    <td className="py-4 px-2 font-mono text-slate-900 dark:text-slate-100 text-right align-middle">{fCurrencyNoSuffix(summary.actual)}</td>
                                                    <td className="py-4 px-2 font-mono text-slate-600 dark:text-slate-400 text-right align-middle">{fCurrencyNoSuffix(summary.lastYearActual)}</td>
                                                    <td className="py-4 px-2 text-center align-middle"><span className={`tracking-tighter ${summary.yoyGrowth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{fPercent(summary.yoyGrowth)}</span></td>
                                                    <td className={`py-4 pr-6 font-mono text-right align-middle ${summary.actual - summary.lastYearActual >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                        {fCurrencyNoSuffix(summary.actual - summary.lastYearActual)}
                                                    </td>
                                                </>
                                            )}
                                            {analysisMode === 'mom' && (
                                                <>
                                                    <td className="py-4 px-2 font-mono text-slate-900 dark:text-slate-100 text-right align-middle">{fCurrencyNoSuffix(summary.actual)}</td>
                                                    <td className="py-4 px-2 font-mono text-slate-600 dark:text-slate-400 text-right align-middle">{fCurrencyNoSuffix(summary.lastMonthActual)}</td>
                                                    <td className="py-4 px-2 text-center align-middle"><span className={`tracking-tighter ${summary.momGrowth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>{fPercent(summary.momGrowth)}</span></td>
                                                    <td className={`py-4 pr-6 font-mono text-right align-middle ${summary.actual - summary.lastMonthActual >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                        {fCurrencyNoSuffix(summary.actual - summary.lastMonthActual)}
                                                    </td>
                                                </>
                                            )}
                                            {analysisMode === 'cumulative' && (
                                                <>
                                                    <td className="py-4 px-2 font-mono text-slate-600 dark:text-slate-400 text-right align-middle">{fCurrencyNoSuffix(summary.cumulativeTarget)}</td>
                                                    <td className="py-4 px-2 font-mono text-slate-900 dark:text-slate-100 text-right align-middle">{fCurrencyNoSuffix(summary.cumulativeActual)}</td>
                                                    <td className="py-4 px-2 text-center align-middle"><span className="text-slate-900 dark:text-slate-100 tracking-tighter">{fPercent(summary.cumulativeAchievement)}</span></td>
                                                    <td className={`py-4 pr-6 font-mono text-right align-middle ${summary.cumulativeActual - summary.cumulativeTarget >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'}`}>
                                                        {fCurrencyNoSuffix(summary.cumulativeActual - summary.cumulativeTarget)}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Performance Horizontal Chart (RIGHT - 2/5) */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-fit">
                            <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center">
                                <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                    <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                                    달성률 시각화 {drillDownData.length > 12 && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 normal-case ml-2">(상위 10개 요약)</span>}
                                </h3>
                            </div>
                            <div className="p-4 h-[440px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={slicedChartData} margin={{ left: -10, right: 10, top: 40, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 900, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
                                            interval={0}
                                            angle={slicedChartData.length > 5 ? -15 : 0}
                                            dx={slicedChartData.length > 5 ? -5 : 0}
                                        />
                                        <YAxis hide domain={[0, Math.min(200, Math.max(110, ...slicedChartData.map(d => d.achievement || 0)))]} />
                                        <Tooltip 
                                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }} 
                                            contentStyle={{ 
                                                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                                borderRadius: '16px', 
                                                fontSize: '12px', 
                                                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', 
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                                                color: isDarkMode ? '#f8fafc' : '#0f172a' 
                                            }} 
                                            itemStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}
                                        />

                                        <ReferenceLine
                                            y={100}
                                            stroke="#cbd5e1"
                                            strokeDasharray="3 3"
                                            label={{
                                                position: 'insideTopRight',
                                                value: '목표(100%)',
                                                fill: '#94a3b8',
                                                fontSize: 10,
                                                fontWeight: 900,
                                                offset: 10
                                            }}
                                        />
                                        <ReferenceLine
                                            y={summary.progressRate}
                                            stroke="#6366f1"
                                            strokeDasharray="5 5"
                                            strokeWidth={2}
                                            label={{
                                                position: 'insideTopLeft',
                                                value: `진도율(${summary.progressRate.toFixed(1)}%)`,
                                                fill: '#6366f1',
                                                fontSize: 10,
                                                fontWeight: 900,
                                                offset: 10
                                            }}
                                        />

                                        <Bar dataKey="achievement" radius={[8, 8, 0, 0]} barSize={slicedChartData.length > 8 ? 20 : 35}>
                                            {slicedChartData.map((e, i) => (
                                                <Cell key={i} fill={TEAM_COLORS[e.name]?.main || CHART_COLORS[i % CHART_COLORS.length]} opacity={0.8} />
                                            ))}
                                            <LabelList
                                                dataKey="achievement"
                                                position="top"
                                                formatter={(v) => slicedChartData.length > 10 ? '' : `${v.toFixed(1)}%`}
                                                fontSize={10}
                                                fontWeight={900}
                                                fill="#475569"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Pie Chart for Composition Ratio - Full Width below or next to the bar chart */}
                <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col mt-4 h-fit">
                    <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md flex justify-between items-center">
                        <h3 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                            <PieChartIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
                            {view === 'dashboard_type' ? '유형별 구성비' : '팀별 구성비'} {drillDownData.length > 10 && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 normal-case ml-2">(상위 10개 요약)</span>}
                        </h3>
                    </div>
                    <div className="p-4 h-[440px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={slicedChartData.filter(d => (d.actual || 0) > 0)}
                                    dataKey="actual"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                >
                                    {slicedChartData.filter(d => (d.actual || 0) > 0).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={TEAM_COLORS[entry.name]?.main || CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="name" position="outside" offset={20} stroke="none" fill="#475569" fontSize={10} fontWeight="bold" />
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => {
                                        const total = drillDownData.reduce((acc, curr) => acc + (curr.actual || 0), 0);
                                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                                        return [`${fCurrencyNoSuffix(value)} (${percent}%)`, name];
                                    }}
                                    contentStyle={{ 
                                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                                        borderRadius: '16px', 
                                        fontSize: '12px', 
                                        border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)', 
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', 
                                        color: isDarkMode ? '#f8fafc' : '#0f172a' 
                                    }}
                                    itemStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-8">
                <TodoWidget />
            </div>
        </div>
    );
}
