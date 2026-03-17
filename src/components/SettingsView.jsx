import { useState } from 'react';
import { CalendarDays, ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { BusinessDaysSubView } from './settings/BusinessDaysSubView';
import { OrganizationSubView } from './settings/OrganizationSubView';
import { TypesSubView } from './settings/TypesSubView';
import { DataUploadSubView } from './settings/DataUploadSubView';
import { AccountsSubView, LogsSubView, SuperAdminManageSubView } from './settings/AdminSubViews';

export function SettingsView({ 
    masterData, 
    setMasterData, 
    selectedMonth, 
    subView, 
    profile, 
    isDemo 
}) {
    const [selectedYear, setSelectedYear] = useState('2026');

    const renderHeader = () => {
        const titleMap = {
            bizDays: { main: 'Business Days', sub: '영업일수 및 공휴일 상세 설정' },
            org: { main: 'Organization', sub: '조직 및 인원 구성 관리' },
            types: { main: 'Type Definitions', sub: '시스템 유형 및 코드 관리' },
            accounts: { main: 'Member Management', sub: profile?.role === 'super_admin' ? '전체 사용자 권한 및 플랜 관리' : '멤버 초대 및 권한 승인' },
            logs: { main: 'Access Logs', sub: '시스템 접속 이력 모니터링' },
            data: { main: 'Sales Data Center', sub: '매출 및 목표 데이터 업로드' }
        };

        const current = titleMap[subView] || titleMap.data;

        return (
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-2 italic uppercase">
                        {current.main}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
                        {current.sub}
                    </p>
                </div>

                {subView === 'bizDays' && (
                    <div className="flex items-center gap-2 bg-white p-2 pl-4 pr-3 rounded-2xl border border-slate-200 shadow-sm relative">
                        <CalendarDays size={20} className="text-indigo-500" />
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="bg-transparent font-black text-slate-700 outline-none appearance-none pr-6 cursor-pointer w-full z-10"
                        >
                            <option value="2026">2026년</option>
                            <option value="2025">2025년</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 text-slate-400 pointer-events-none z-0" />
                    </div>
                )}
            </header>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 space-y-8 pb-20">
            {isDemo && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 rounded-[32px] flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-amber-800 dark:text-amber-400 tracking-tight mb-1 italic">DEMO MODE ACCESS</h3>
                        <p className="text-amber-700/70 dark:text-amber-400/70 font-bold text-sm leading-relaxed">
                            현재 체험 모드로 접속 중입니다. 설정 변경 및 데이터 업로드는 제한되지만,<br/>
                            데모 데이터를 통해 대시보드의 모든 분석 기능을 자유롭게 테스트해 보실 수 있습니다.
                        </p>
                    </div>
                </div>
            )}

            {renderHeader()}

            <AnimatePresence mode="wait">
                <motion.div
                    key={subView}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {subView === 'bizDays' && <BusinessDaysSubView year={selectedYear} profile={profile} isDemo={isDemo} />}
                    {subView === 'org' && <OrganizationSubView setMasterData={setMasterData} masterData={masterData} profile={profile} isDemo={isDemo} />}
                    {subView === 'types' && <TypesSubView setMasterData={setMasterData} masterData={masterData} profile={profile} isDemo={isDemo} />}
                    {subView === 'data' && <DataUploadSubView setMasterData={setMasterData} masterData={masterData} profile={profile} isDemo={isDemo} />}
                    {subView === 'accounts' && (
                        profile?.role === 'super_admin' 
                        ? <SuperAdminManageSubView isDemo={isDemo} /> 
                        : <AccountsSubView profile={profile} isDemo={isDemo} />
                    )}
                    {subView === 'logs' && <LogsSubView profile={profile} isDemo={isDemo} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
