import { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { useSalesBI } from './hooks/useSalesBI';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { PricingView } from './components/PricingView';
import { SupportView } from './components/SupportView';
import { ManualView } from './components/ManualView';
import { Sidebar } from './components/Sidebar';
import { Greeting } from './components/Greeting';
import { Toast } from './components/Toast';

export default function App() {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [toast, setToast] = useState(null);
    const [view, setView] = useState(() => localStorage.getItem('dashboard_view') || (profile?.role === 'super_admin' ? 'settings' : 'dashboard_team'));
    const [impersonatedProfile, setImpersonatedProfile] = useState(null);
    const [settingsSubView, setSettingsSubView] = useState(() => profile?.role === 'super_admin' ? 'accounts' : 'bizDays');
    
    // UI States
    const [mainTab, setMainTab] = useState('current');
    const [analysisMode, setAnalysisMode] = useState('goal');
    const [metricType, setMetricType] = useState('amount');
    const [amountUnit, setAmountUnit] = useState('1M');
    const [weightUnit, setWeightUnit] = useState('KG');
    const [path, setPath] = useState([{ level: 'root', id: 'all', name: '전체' }]);
    const [currentTime, setCurrentTime] = useState('');
    const triggerToast = (message, type = 'info') => setToast({ message, type });


    const activeProfile = impersonatedProfile || profile;
    const { bi, masterData, setMasterData, selectedMonth, setSelectedMonth, bizDayInfo, isLoading: loadingData } = useSalesBI(activeProfile, isDemo);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => { setSession(s); if (s) fetchProfile(s.user.id); else setLoading(false); });
        supabase.auth.onAuthStateChange((_, s) => { setSession(s); if (s) fetchProfile(s.user.id); else { setProfile(null); setLoading(false); } });
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchProfile = async (uid) => {
        const { data } = await supabase.from('profiles').select('*, companies(*)').eq('id', uid).single();
        if (data?.email === 'superadmin@emasterdrs.ai') {
            data.role = 'super_admin';
            if (view.startsWith('dashboard')) setView('settings');
            setSettingsSubView('accounts');
        } else if (data?.email === 'emasterdrs@gmail.com') {
            data.plan = 'ultra'; // Force Ultra for this specific user
        }
        setProfile(data);
        setLoading(false);
    };

    const handleLogout = () => { setIsDemo(false); setSession(null); setProfile(null); setImpersonatedProfile(null); supabase.auth.signOut(); localStorage.removeItem('dashboard_view'); };
    const handleDemoLogin = (p) => { setIsDemo(true); setProfile({ id: 'demo', plan: p, role: 'user', company_id: 'demo', companies: { name: 'DEMO' } }); setSession({ user: { id: 'demo' } }); setView('dashboard_team'); };
    const handleImpersonate = (u) => { setImpersonatedProfile(u); setView('dashboard_team'); triggerToast(`${u.full_name} 계정으로 대시보드를 조회합니다.`, 'info'); };

    const currentPath = path[path.length - 1];
    const summary = useMemo(() => bi.getSummary(selectedMonth, currentPath.level, currentPath.id, mainTab, metricType, bizDayInfo), [bi, selectedMonth, currentPath, mainTab, metricType, bizDayInfo]);
    const drillDownData = useMemo(() => {
        const next = view === 'dashboard_type' ? { root: 'type', type: 'type' } : { root: 'team', team: 'person', person: 'customer', customer: 'item', item: 'item' };
        return bi.getDrillDown(selectedMonth, currentPath.level, currentPath.id, next[currentPath.level], mainTab, metricType, bizDayInfo);
    }, [bi, selectedMonth, currentPath, mainTab, metricType, bizDayInfo, view]);

    const slicedChartData = useMemo(() => drillDownData.length > 10 ? [...drillDownData].sort((a,b) => b.actual - a.actual).slice(0, 10) : drillDownData, [drillDownData]);

    const fMetric = (v) => {
        const u = metricType === 'amount' ? { '1M': 1000000, '1': 1, '100M': 100000000 }[amountUnit] : 1;
        const s = metricType === 'amount' ? { '1M': '백만', '1': '원', '100M': '억' }[amountUnit] : 'kg';
        return `${(v / u).toLocaleString()}${s}`;
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    // Guest Support View (Session-less)
    if (view === 'support' && !session) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-[#020617] p-6 overflow-y-auto">
                <SupportView profile={null} onBack={() => setView('dashboard_team')} triggerToast={triggerToast} isGuest={true} />
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        );
    }

    if (!session) return <AuthView onLoginSuccess={u => fetchProfile(u.id)} onDemoLogin={handleDemoLogin} onGuestSupport={() => setView('support')} />;
    if (!profile?.company_id && !isDemo) return <OnboardingView user={session.user} onComplete={() => fetchProfile(session.user.id)} />;

    return (
        <div className="h-screen bg-slate-50 dark:bg-[#020617] flex overflow-hidden font-['Gmarket']">
            <Sidebar view={view} setView={setView} profile={profile} isDemo={isDemo} settingsSubView={settingsSubView} setSettingsSubView={setSettingsSubView} onLogout={handleLogout} />
            <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar">
                {impersonatedProfile && (
                    <div className="mb-6 p-4 bg-indigo-600 text-white rounded-[24px] flex items-center justify-between shadow-lg animate-in slide-in-from-top-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">👀</div>
                            <p className="text-sm font-black">
                                <span className="underline">{impersonatedProfile.full_name}</span>({impersonatedProfile.email}) 님의 화면을 조회 중입니다.
                            </p>
                        </div>
                        <button onClick={() => setImpersonatedProfile(null)} className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all">조회 종료</button>
                    </div>
                )}
                <Greeting profile={activeProfile} />
                <div className="mt-8">
                    {view.startsWith('dashboard') && (
                        <DashboardView 
                            summary={summary} drillDownData={drillDownData} slicedChartData={slicedChartData} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                            currentTime={currentTime} bizDayInfo={bizDayInfo} mainTab={mainTab} setMainTab={setMainTab} analysisMode={analysisMode} setAnalysisMode={setAnalysisMode}
                            path={path} setPath={setPath} metricType={metricType} setMetricType={setMetricType} amountUnit={amountUnit} setAmountUnit={setAmountUnit} 
                            weightUnit={weightUnit} setWeightUnit={setWeightUnit} fMetric={fMetric} fPercent={v => `${v.toFixed(1)}%`} fCurrencyNoSuffix={v => v.toLocaleString()}
                            handleDrillDown={i => setPath([...path, { level: view === 'dashboard_type' ? 'type' : path.length === 1 ? 'team' : path.length === 2 ? 'person' : 'customer', id: i.id, name: i.name }])} view={view} isDarkMode={false} userPlan={profile.plan} 
                        />
                    )}
                    {view === 'settings' && <SettingsView masterData={masterData} setMasterData={setMasterData} subView={settingsSubView} profile={profile} isDemo={isDemo} onImpersonate={handleImpersonate} />}
                    {view === 'pricing' && <PricingView currentPlan={profile.plan} onUpgrade={p => setProfile({...profile, plan: p.id})} onInquiry={() => setView('support')} />}
                    {view === 'support' && <SupportView profile={profile} onBack={() => setView('dashboard_team')} triggerToast={triggerToast} />}
                    {view === 'manual' && <ManualView />}
                </div>
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
