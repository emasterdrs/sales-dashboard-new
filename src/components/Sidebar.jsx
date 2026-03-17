import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, BarChart3, PieChart as PieChartIcon, LayoutGrid, Settings, CreditCard, BookOpen, MessageSquare } from 'lucide-react';

export function Sidebar({ view, setView, profile, isDemo, settingsSubView, setSettingsSubView, onLogout }) {
    if (!profile) return null;

    return (
        <aside className="hidden md:flex w-72 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-white/5 flex-col py-10 z-50 h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] px-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 px-2 mb-12">
                <button onClick={() => setView('dashboard_team')} className="group flex items-center gap-3 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-transform">
                        <Gauge size={28} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white truncate max-w-[150px]">{profile.companies?.name || 'DASHBOARD'}</h1>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">BUSINESS BI OS</p>
                    </div>
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                <SidebarItem active={view === 'dashboard_team'} icon={BarChart3} label="매출 실적 (팀별)" onClick={() => setView('dashboard_team')} />
                <SidebarItem active={view === 'dashboard_type'} icon={PieChartIcon} label="매출 실적 (유형별)" onClick={() => setView('dashboard_type')} />
                <SidebarItem active={view === 'dashboard_custom'} icon={LayoutGrid} label={profile.plan === 'pro' ? "커스텀" : "커스텀 (PRO)"} onClick={() => profile.plan === 'pro' ? setView('dashboard_custom') : setView('pricing')} />

                {['admin', 'super_admin'].includes(profile.role) && (
                    <div className="pt-4 border-t border-slate-50">
                        <SidebarItem active={view === 'settings'} icon={Settings} label="설정" onClick={() => setView('settings')} />
                        <AnimatePresence>
                            {view === 'settings' && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ml-8 mt-2 space-y-1 overflow-hidden border-l-2 pl-4">
                                    {[
                                        { id: 'bizDays', name: '영업일수' }, { id: 'org', name: '조직 및 인원' }, { id: 'types', name: '유형명' },
                                        { id: 'data', name: '판매 데이터' }, { id: 'accounts', name: '멤버 관리' }
                                    ].map(sub => (
                                        <button key={sub.id} onClick={() => setSettingsSubView(sub.id)} className={`block w-full text-left py-2 text-sm font-black transition-all ${settingsSubView === sub.id ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
                                            {sub.name}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <SidebarItem active={view === 'pricing'} icon={CreditCard} label="Pricing" onClick={() => setView('pricing')} />
                    <SidebarItem active={view === 'support'} icon={MessageSquare} label="Support" onClick={() => setView('support')} />
                    <button onClick={onLogout} className="mt-8 text-xs font-bold text-slate-400 hover:text-rose-500 w-full text-left px-4">로그아웃</button>
                </div>
            </nav>
        </aside>
    );
}

function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
            <div className={`p-2 rounded-xl ${active ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}><Icon size={18} /></div>
            <span className="text-sm font-black">{label}</span>
        </button>
    );
}
