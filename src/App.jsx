import { useState, useMemo, useEffect } from 'react';
import {
    LayoutDashboard,
    DollarSign,
    Target,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Settings,
    CreditCard,
    AlertCircle,
    Download,
    Eye,
    Zap,
    Scale,
    TrendingUp,
    TrendingDown,
    Menu,
    X,
    LayoutGrid,
    Globe,
    ChevronDown,
    Clock,
    Filter,
    BarChart3,
    Settings2,
    PieChart as PieChartIcon,
    Command,
    Sparkles,
    Activity,
    Shield,
    Layers,
    Gauge
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Area,
    Cell,
    PieChart,
    Pie,
    LabelList,
    ReferenceLine
} from 'recharts';

import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFullDataset, convertToCSV, downloadCSV } from './data/generateSalesData';
import actualDataJson from './data/actual_data.json';
import { TEAMS, SALESPERSONS, ALL_CUSTOMERS, ALL_PRODUCTS } from './data/foodDistributionData';
import { SalesBI, SETTINGS } from './data/mockEngine';
import { getYearlyCalendarData } from './lib/dateUtils';
import { Quote } from './components/Quote';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { supabase } from './lib/supabase';
// import { BondDashboard } from './components/BondDashboard'; // 채권 대시보드 제거



// 색상 팔레트 최적화
const TEAM_COLORS = {
    '영업1팀': { main: '#6366f1', grad: 'from-indigo-600 to-blue-500' },
    '영업2팀': { main: '#10b981', grad: 'from-emerald-600 to-teal-500' },
    '영업3팀': { main: '#f59e0b', grad: 'from-amber-600 to-orange-500' },
    '영업4팀': { main: '#ef4444', grad: 'from-rose-600 to-pink-500' },
    '영업5팀': { main: '#8b5cf6', grad: 'from-violet-600 to-purple-500' },
    '전체': { main: '#3b82f6', grad: 'from-blue-600 to-indigo-500' },
    '기타': { main: '#94a3b8', grad: 'from-slate-400 to-slate-500' }
};

const CHART_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#0ea5e9', '#d946ef', '#f97316', '#14b8a6', '#64748b'
];

// 통화/중량 단위 설정
const CURRENCY_UNITS = [
    { key: '100M', label: '억원', divisor: 100000000, suffix: '억' },
    { key: '1M', label: '백만원', divisor: 1000000, suffix: '백만' },
    { key: '1K', label: '천원', divisor: 1000, suffix: '천' },
    { key: '1', label: '원', divisor: 1, suffix: '원' }
];

const WEIGHT_UNITS = [
    { key: 'TON', label: '톤(Ton)', divisor: 1000, suffix: '톤' },
    { key: 'KG', label: '킬로그램(KG)', divisor: 1, suffix: 'kg' },
    { key: 'BOX', label: '박스(Box)', divisor: 10, suffix: 'box' },
    { key: 'EA', label: '개(EA)', divisor: 1, suffix: 'ea' }
];

const fPercent = (val) => `${(val || 0).toFixed(1)}%`;
import { DashboardView } from './components/DashboardView';
import { Greeting } from './components/Greeting';
import { TodoWidget } from './components/TodoWidget';

function SidebarIcon({ icon: Icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${active
                ? 'bg-indigo-500/10 dark:bg-white/5 ring-1 ring-indigo-500/20 dark:ring-white/10'
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
        >
            <div className={`p-2 rounded-xl transition-all duration-500 ${active
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 scale-110'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white'
                }`}>
                <Icon size={18} />
            </div>
            <span className={`text-[13px] font-black tracking-tight transition-colors whitespace-nowrap ${active ? 'text-indigo-600 dark:text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                {label}
            </span>
            {active && (
                <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" 
                />
            )}
        </button>
    );
}

export default function App() {
    // 1. Supabase Auth & Profile State
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        // Init session
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            setSession(initialSession);
            if (initialSession) fetchProfile(initialSession.user.id);
            else setLoadingProfile(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoadingProfile(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId) => {
        setLoadingProfile(true);
        try {
            // Get current user directly from Supabase for most reliable email check
            const { data: { user } } = await supabase.auth.getUser();
            
            const { data, error } = await supabase
                .from('profiles')
                .select('*, companies(*)')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // [PROMOTION] Force super_admin for the master account
            if (user?.email === 'emasterdrs@gmail.com') {
                data.role = 'super_admin';
            }

            setProfile(data);
        } catch (e) {
            console.error('Profile fetch error:', e);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        localStorage.removeItem('session_start_time');
    };

    // 1시간(connection time) 자동 로그아웃 제한
    useEffect(() => {
        if (!session) return;

        let sessionStartTime = localStorage.getItem('session_start_time');
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000; // 1시간 (밀리초)

        if (!sessionStartTime) {
            sessionStartTime = now;
            localStorage.setItem('session_start_time', sessionStartTime.toString());
        } else {
            sessionStartTime = parseInt(sessionStartTime, 10);
        }

        const timePassed = now - sessionStartTime;

        if (timePassed >= ONE_HOUR) {
            handleLogout();
            alert('접속한지 1시간이 지나 자동 로그아웃 되었습니다.');
            return;
        }

        const timer = setTimeout(() => {
            handleLogout();
            alert('접속한지 1시간이 지나 자동 로그아웃 되었습니다.');
        }, ONE_HOUR - timePassed);

        return () => clearTimeout(timer);
    }, [session]);

    // 2. View States
    const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [view, setView] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return hash || localStorage.getItem('dashboard_view') || 'dashboard_team';
    });

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== view) setView(hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [view]);

    useEffect(() => {
        localStorage.setItem('dashboard_view', view);
        if (window.location.hash !== `#${view}`) {
            window.location.hash = view;
        }
    }, [view]);

    const [mainTab, setMainTab] = useState('current');
    const [analysisMode, setAnalysisMode] = useState('goal');
    const [metricType, setMetricType] = useState('amount');
    const [path, setPath] = useState([{ level: 'root', id: 'all', name: '전체' }]);
    const [amountUnit, setAmountUnit] = useState('1M');
    const [weightUnit, setWeightUnit] = useState('KG');
    const [showAmountDropdown, setShowAmountDropdown] = useState(false);
    const [showWeightDropdown, setShowWeightDropdown] = useState(false);
    const [fontFamily, setFontFamily] = useState('Gmarket');
    const [settingsSubView, setSettingsSubView] = useState('bizDays');

    // 3. Calculation & Master Data Logic
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // Cloud Data Fetcher
    const fetchCloudData = async () => {
        if (!profile || !profile.company_id || profile.status !== 'approved') return;

        setIsLoadingData(true);
        try {
            // 1. Fetch Sales Actual
            const { data: actual, error: actualErr } = await supabase
                .from('sales_actual')
                .select('*')
                .eq('company_id', profile.company_id);
            if (actualErr) throw actualErr;

            // 2. Fetch Sales Target
            const { data: target, error: targetErr } = await supabase
                .from('sales_target')
                .select('*')
                .eq('company_id', profile.company_id);
            if (targetErr) throw targetErr;

            // 3. Fetch Settings
            const { data: setRes, error: setErr } = await supabase
                .from('settings')
                .select('data')
                .eq('company_id', profile.company_id)
                .maybeSingle();

            // Map DB records back to UI format (Korean keys)
            const mappedActual = (actual || []).map(r => ({
                '년도월': r.year_month,
                '영업팀': r.team_name,
                '영업사원명': r.person_name,
                '거래처코드': r.customer_code,
                '거래처명': r.customer_name,
                '품목유형': r.type_name,
                '품목코드': r.item_code,
                '품목명': r.item_name,
                '금액': r.amount,
                '매출금액': r.amount
            }));

            const mappedTarget = (target || []).map(r => ({
                '년도월': r.year_month,
                '영업팀': r.team_name,
                '영업사원명': r.person_name,
                '금액': r.amount,
                '목표금액': r.amount
            }));

            setMasterData({
                actual: mappedActual,
                target: mappedTarget
            });

            // Sync settings to localStorage for the existing components (backward compatibility)
            if (setRes && setRes.data) {
                localStorage.setItem('dashboard_settings', JSON.stringify(setRes.data));
            }

        } catch (e) {
            console.error('Cloud data fetch failed:', e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (profile && profile.company_id && profile.status === 'approved') {
            fetchCloudData();
        }
    }, [profile]);

    const [masterData, setMasterData] = useState(() => {
        try {
            const saved = localStorage.getItem('dashboard_master_data');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return { actual: [], target: [] };
    });


    useEffect(() => {
        try {
            localStorage.setItem('dashboard_master_data', JSON.stringify(masterData));
        } catch (e) { }
    }, [masterData]);



    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const dd = String(now.getDate()).padStart(2, '0');
            const hh = String(now.getHours()).padStart(2, '0');
            const min = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${yyyy}년 ${mm}월 ${dd}일 ${hh}:${min}:${ss}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const bizDayInfo = useMemo(() => {
        if (!selectedMonth || !selectedMonth.includes('-')) return { currentBusinessDay: 1, totalBusinessDays: 20 };
        const [year, month] = selectedMonth.split('-').map(Number);
        const calendar = getYearlyCalendarData(year);
        const monthData = calendar.find(m => m.month === month);

        if (!monthData) return { currentBusinessDay: 1, totalBusinessDays: 20 };

        let toggledDays = {};
        try {
            const savedData = localStorage.getItem('dashboard_settings');
            if (savedData) {
                const data = JSON.parse(savedData);
                toggledDays = data[`toggledDays_${year}`] || {};
            }
        } catch (e) { }

        const processedDays = monthData.days.map(d => {
            const isToggled = toggledDays[d.date] !== undefined;
            let isBusinessDay = d.isBusinessDay;
            if (isToggled) isBusinessDay = toggledDays[d.date];
            return { ...d, isBusinessDay };
        });

        const totalBusinessDays = processedDays.filter(d => d.isBusinessDay).length || 20;

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        const nowY = now.getFullYear();
        const nowM = now.getMonth() + 1;

        const isPastMonth = year < nowY || (year === nowY && month < nowM);
        const isFutureMonth = year > nowY || (year === nowY && month > nowM);

        let currentBusinessDay = 0;
        if (isPastMonth) {
            currentBusinessDay = totalBusinessDays;
        } else if (isFutureMonth) {
            currentBusinessDay = 0;
        } else {
            const yesterdayIso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            currentBusinessDay = processedDays.filter(d => d.isBusinessDay && d.date <= yesterdayIso).length;
        }

        return { currentBusinessDay, totalBusinessDays };
    }, [selectedMonth]);

    // 전역 설정 연동 (Legacy 지원용으로 남겨두되 가급적 파라미터 전달 권장)
    useEffect(() => {
        SETTINGS.currentBusinessDay = bizDayInfo.currentBusinessDay || 1;
        SETTINGS.businessDays[selectedMonth] = bizDayInfo.totalBusinessDays;
        SETTINGS.selectedMonth = selectedMonth;
    }, [bizDayInfo, selectedMonth]);

    const fMetric = (val) => {
        if (val === undefined || val === null) return '0';
        if (metricType === 'amount') {
            const config = CURRENCY_UNITS.find(u => u.key === amountUnit) || CURRENCY_UNITS[1];
            const converted = val / config.divisor;
            return `${converted.toLocaleString(undefined, { maximumFractionDigits: (converted >= 10 || amountUnit === '1') ? 0 : 1 })}${config.suffix}`;
        } else {
            const config = WEIGHT_UNITS.find(u => u.key === weightUnit) || WEIGHT_UNITS[0];
            const converted = val / config.divisor;
            return `${converted.toLocaleString(undefined, { maximumFractionDigits: converted >= 10 ? 0 : 2 })}${config.suffix}`;
        }
    };
    const fCurrency = fMetric;

    const fMetricNoSuffix = (val) => {
        if (val === undefined || val === null) return '0';
        if (metricType === 'amount') {
            const config = CURRENCY_UNITS.find(u => u.key === amountUnit) || CURRENCY_UNITS[1];
            const converted = val / config.divisor;
            return converted.toLocaleString(undefined, { maximumFractionDigits: (converted >= 10 || amountUnit === '1') ? 0 : 1 });
        } else {
            const config = WEIGHT_UNITS.find(u => u.key === weightUnit) || WEIGHT_UNITS[0];
            const converted = val / config.divisor;
            return converted.toLocaleString(undefined, { maximumFractionDigits: converted >= 10 ? 0 : 2 });
        }
    };
    const fCurrencyNoSuffix = fMetricNoSuffix;

    const formatDisplayMonth = (ym) => {
        const [y, m] = ym.split('-');
        return `${y}년 ${m}월`;
    };

    const bi = useMemo(() => new SalesBI(masterData.actual, masterData.target), [masterData]);

    const currentView = path[path.length - 1];

    const summary = useMemo(() => {
        return bi.getSummary(selectedMonth, currentView.level, currentView.id, mainTab, metricType, bizDayInfo);
    }, [bi, selectedMonth, currentView, mainTab, metricType, bizDayInfo]);

    const drillDownData = useMemo(() => {
        const nextLevelMap = view === 'dashboard_type'
            ? { root: 'type', type: 'type' }
            : { root: 'team', team: 'person', person: 'customer', customer: 'item', item: 'item' };
        const nextLevel = nextLevelMap[currentView.level];
        return bi.getDrillDown(selectedMonth, currentView.level, currentView.id, nextLevel, mainTab, metricType, bizDayInfo);
    }, [path, bi, selectedMonth, currentView, mainTab, metricType, bizDayInfo]);

    // 대안 A: 가독성 중심 데이터 요약 (Top 10 + 기타)
    const slicedChartData = useMemo(() => {
        if (!drillDownData || drillDownData.length <= 10) return drillDownData;

        // 실적(actual) 순으로 정렬하여 상위 10개 추출
        const sorted = [...drillDownData].sort((a, b) => (b.actual || 0) - (a.actual || 0));
        const top10 = sorted.slice(0, 10);
        const others = sorted.slice(10);

        const otherSummary = others.reduce((acc, curr) => {
            acc.actual += (curr.actual || 0);
            acc.target += (curr.target || 0);
            acc.weight += (curr.weight || 0);
            acc.lastYear += (curr.lastYear || 0);
            acc.lastMonth += (curr.lastMonth || 0);
            acc.cumulativeActual += (curr.cumulativeActual || 0);
            acc.cumulativeTarget += (curr.cumulativeTarget || 0);
            return acc;
        }, {
            id: 'others_group',
            name: `기타(${others.length}개)`,
            actual: 0,
            target: 0,
            weight: 0,
            lastYear: 0,
            lastMonth: 0,
            cumulativeActual: 0,
            cumulativeTarget: 0
        });

        // 달성률 재계산
        otherSummary.achievement = otherSummary.target > 0 ? (otherSummary.actual / otherSummary.target) * 100 : (otherSummary.actual > 0 ? 100 : 0);

        return [...top10, otherSummary];
    }, [drillDownData]);

    const handleDrillDown = (item) => {
        if (item.id === 'others_group') return; // 기타 합계는 드릴다운 불가
        if (currentView.level === 'type' || currentView.level === 'item') return;
        const nextLevelMap = view === 'dashboard_type'
            ? { root: 'type' }
            : { root: 'team', team: 'person', person: 'customer', customer: 'item' };
        const nextLvl = nextLevelMap[currentView.level];
        if (!nextLvl) return;
        setPath([...path, { level: nextLvl, id: item.id || item.name, name: item.name }]);
    };



    useEffect(() => {
        setPath([{ level: view === 'dashboard_type' ? 'type' : 'root', id: 'all', name: '전체' }]);
    }, [view]);

    const fontMap = {
        'Gmarket': 'font-style-Gmarket',
        'Pretendard': 'font-style-Pretendard',
        'IBM': 'font-style-IBM',
        'Nanum': 'font-style-Nanum',
        'Serif': 'font-style-Serif'
    };

    if (!session) {
        return <AuthView onLoginSuccess={(user) => fetchProfile(user.id)} />;
    }

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile || !profile.company_id) {
        return <OnboardingView user={session.user} onComplete={() => fetchProfile(session.user.id)} />;
    }

    if (profile.status === 'pending') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center text-slate-800">
                <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-500 mb-8 border border-amber-100 shadow-xl shadow-amber-50">
                    <Clock size={48} className="animate-pulse" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">Pending Approval</h2>
                <p className="text-slate-400 font-bold max-w-sm leading-relaxed mb-8">
                    {profile.companies?.name}의 참여 신청이 완료되었습니다.<br />
                    관리자가 승인하면 모든 데이터를 볼 수 있습니다.
                </p>
                <button onClick={handleLogout} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-rose-500 transition-colors">
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-600 dark:text-slate-400 flex flex-col md:flex-row overflow-x-hidden pb-20 md:pb-0 ${fontMap[fontFamily]}`}>
            <aside className="hidden md:flex w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-white/5 flex-col py-10 z-50 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] px-6">
                <div className="flex items-center gap-4 px-2 mb-12">
                    <div className="flex flex-col justify-center">
                        <button onClick={() => setView('dashboard_team')} className="group flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
                                <Gauge size={28} strokeWidth={3} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none hover:text-indigo-600 transition-colors uppercase italic">
                                    {profile.companies?.name || 'DASHBOARD'}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] mt-1">BUSINESS BI OS</p>
                            </div>
                        </button>
                        
                        <div className="mt-6 flex items-center gap-1.5">
                            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                profile.role === 'super_admin' 
                                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10'
                            }`}>
                                {profile.role === 'super_admin' ? 'Master Core' : 'Staff Mode'}
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                        </div>
                    </div>
                </div>

                <nav className="flex-1">
                    <div className="space-y-2">
                        <SidebarIcon active={view === 'dashboard_team'} icon={BarChart3} label="매출 실적 (팀별)" onClick={() => setView('dashboard_team')} />
                        <SidebarIcon active={view === 'dashboard_type'} icon={PieChartIcon} label="매출 실적 (유형별)" onClick={() => setView('dashboard_type')} />

                        {['admin', 'super_admin'].includes(profile.role) && (
                            <SidebarIcon active={view === 'settings'} icon={Settings} label="설정" onClick={() => setView('settings')} />
                        )}

                        <AnimatePresence>
                            {view === 'settings' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="ml-8 mt-2 space-y-1 border-l-2 border-indigo-50 pl-4 overflow-hidden"
                                >
                                    {[
                                        { id: 'bizDays', name: '영업일수' },
                                        { id: 'org', name: '조직 및 인원' },
                                        { id: 'types', name: '유형명' },
                                        { id: 'data', name: '판매 데이터' },
                                        { id: 'accounts', name: '멤버 관리' },
                                        ...(profile.role === 'super_admin' ? [{ id: 'logs', name: '접속 로그' }] : [])
                                    ].map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => setSettingsSubView(sub.id)}
                                            className={`block w-full text-left py-2 text-sm font-black transition-all transform hover:translate-x-1 ${settingsSubView === sub.id ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>

                <div className="pt-8 mt-8 border-t border-slate-100 dark:border-white/5 px-2 flex justify-between items-center">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 flex-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="font-extrabold text-[12px] uppercase">{profile.full_name?.slice(0, 1)}</span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[12px] font-black text-slate-800 dark:text-slate-200 truncate leading-tight tracking-tighter">{profile.full_name}</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{profile.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="ml-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="py-4 px-4 md:py-6 md:px-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 mb-2 md:mb-4">
                        <div className="flex-1 min-w-0 w-full">
                            <Greeting name={profile.full_name} role={profile.role} />
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter italic leading-tight">
                                    {formatDisplayMonth(selectedMonth)} <span className={mainTab === 'expected' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-500 dark:text-emerald-400'}>
                                        {mainTab === 'expected' ? '예상마감 실적' : '현재 매출 실적'}
                                    </span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs md:text-[11px] px-1 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                    <Globe size={10} className="animate-pulse" />
                                    Cloud Connected
                                </span>
                                <button
                                    onClick={() => alert(`[알림] 추후 'AI 진도 경고' 기능이 업데이트 되면, 목표대비 실적이 급격히 미달되는 팀/영업사원이 이곳에 표시됩니다.`)}
                                    className="p-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-full hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors relative"
                                    title="경고 알림 (진도율 미달)"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800 animate-pulse" />
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    title="다크 테마 토글"
                                >
                                    {isDarkMode ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 shrink-0 w-full md:w-auto">
                            <div className="overflow-x-auto no-scrollbar rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800 shadow-sm transition-all hover:border-indigo-500/30">
                                <table className="text-[10px] md:text-[11px] leading-tight min-w-full">
                                    <thead className="bg-slate-100 dark:bg-slate-700/50 border-b border-slate-200 dark:border-white/5">
                                        <tr className="text-slate-900 dark:text-slate-100 font-black text-[11px] md:text-[12px] uppercase tracking-widest whitespace-nowrap">
                                            <th className="px-5 py-3 border-r border-slate-200 dark:border-white/5">Biz Days</th>
                                            <th className="px-5 py-3 border-r border-slate-200 dark:border-white/5">Total</th>
                                            <th className="px-5 py-3 border-r border-slate-200 dark:border-white/5">Progress</th>
                                            <th className="px-5 py-3">1 Day Avg</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center font-black">
                                        <tr className="text-slate-900 dark:text-slate-100 text-lg md:text-xl tracking-tighter">
                                            <td className="px-5 py-2.5 border-r border-slate-200 dark:border-white/5">{bizDayInfo.currentBusinessDay}</td>
                                            <td className="px-5 py-2.5 border-r border-slate-200 dark:border-white/5">{bizDayInfo.totalBusinessDays}</td>
                                            <td className="px-5 py-2.5 border-r border-slate-200 dark:border-white/5">{((bizDayInfo.currentBusinessDay / (bizDayInfo.totalBusinessDays || 1)) * 100).toFixed(1)}%</td>
                                            <td className="px-5 py-2.5">{(100 / (bizDayInfo.totalBusinessDays || 1)).toFixed(1)}%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-[#020617] md:max-h-screen">
                    {view === 'settings' ? (
                        <SettingsView
                            setMasterData={setMasterData}
                            masterData={masterData}
                            refreshData={fetchCloudData}
                            fontFamily={fontFamily}
                            setFontFamily={setFontFamily}
                            fontMap={fontMap}
                            selectedMonth={selectedMonth}
                            subView={settingsSubView}
                            profile={profile}
                            session={session}
                        />
                    ) : (
                        <div className="max-w-[1600px] mx-auto space-y-6">
                            {/* KPI Summary Grid */}
                            <DashboardView
                                summary={summary}
                                drillDownData={drillDownData}
                                slicedChartData={slicedChartData}
                                selectedMonth={selectedMonth}
                                setSelectedMonth={setSelectedMonth}
                                currentTime={currentTime}
                                bizDayInfo={bizDayInfo}
                                mainTab={mainTab}
                                setMainTab={setMainTab}
                                analysisMode={analysisMode}
                                setAnalysisMode={setAnalysisMode}
                                path={path}
                                setPath={setPath}
                                metricType={metricType}
                                setMetricType={setMetricType}
                                amountUnit={amountUnit}
                                setAmountUnit={setAmountUnit}
                                weightUnit={weightUnit}
                                setWeightUnit={setWeightUnit}
                                CURRENCY_UNITS={CURRENCY_UNITS}
                                WEIGHT_UNITS={WEIGHT_UNITS}
                                TEAM_COLORS={TEAM_COLORS}
                                CHART_COLORS={CHART_COLORS}
                                fMetric={fMetric}
                                fPercent={fPercent}
                                fCurrencyNoSuffix={fCurrencyNoSuffix}
                                handleDrillDown={handleDrillDown}
                                view={view}
                                isDarkMode={isDarkMode}
                            />                        </div>
                    )}
                </main>

                <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[28px] p-3 flex items-center justify-around shadow-2xl z-50">
                    <SidebarIcon active={view === 'dashboard_team'} icon={BarChart3} label="팀별 실적" onClick={() => setView('dashboard_team')} color="indigo" />
                    <SidebarIcon active={view === 'dashboard_type'} icon={PieChartIcon} label="유형별 실적" onClick={() => setView('dashboard_type')} color="indigo" />
                    <SidebarIcon active={view === 'settings'} icon={Settings} label="설정" onClick={() => setView('settings')} color="slate" />
                </nav>
            </div>
        </div>
    );
}

function CustomLabel({ x, y, width, value, mainTab, analysisMode }) {
    if (value === undefined) return null;
    const isNeg = parseFloat(value) < 0;
    const label = value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
    const unit = (analysisMode === 'goal' || analysisMode === 'cumulative') ? '%p' : '%';
    return (
        <text x={x + width / 2} y={y - 12} fill={isNeg ? '#f43f5e' : '#10b981'} textAnchor="middle" fontSize={10} fontWeight="900">
            {label}{unit}
        </text>
    );
}

// Helper to format ISO without timezone issues
const toIsoString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
