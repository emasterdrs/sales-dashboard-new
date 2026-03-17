import { useState, useEffect } from 'react';
import { Building2, Clock, Users, Settings, AlertCircle } from 'lucide-react';
import { SettingCard } from './SettingCard';
import { supabase } from '../../lib/supabase';

export function AccountsSubView({ profile, isDemo }) {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!profile?.company_id) return;
        setIsLoading(true);
        try {
            const { data: company } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
            setCompanyInfo(company);
            const { data: mems } = await supabase.from('profiles').select('*').eq('company_id', profile.company_id).order('created_at', { ascending: true });
            setMembers(mems || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [profile]);

    const handleUpdate = async (id, status) => {
        if (isDemo) return;
        await supabase.from('profiles').update({ status }).eq('id', id);
        fetchData();
    };

    if (isLoading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="space-y-8">
            <SettingCard title="회사 가입 정보" icon={Building2} desc="새 구성원 가입용 코드">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-xs text-slate-400">Join Code</span>
                        <div className="text-2xl font-black text-indigo-600 uppercase mt-2">{companyInfo?.registration_code}</div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <span className="text-xs text-slate-400">Members</span>
                        <div className="text-2xl font-black text-slate-800 mt-2">{members.length}명</div>
                    </div>
                </div>
            </SettingCard>

            <SettingCard title="구성원 관리" icon={Users} desc="승인 대기 및 가입 목록">
                <div className="space-y-3">
                    {members.map(m => (
                        <div key={m.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center font-bold">{m.full_name?.[0]}</div>
                                <div>
                                    <h4 className="font-bold">{m.full_name} ({m.role})</h4>
                                    <p className="text-xs text-slate-400">{m.status}</p>
                                </div>
                            </div>
                            {m.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdate(m.id, 'approved')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold">승인</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SettingCard>
        </div>
    );
}

export function LogsSubView({ profile }) {
    if (profile?.role !== 'super_admin') return <div className="p-20 text-center">권한이 없습니다.</div>;
    return (
        <SettingCard title="접속 로그 관리" icon={Clock} desc="시스템 활동 모니터링">
            <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed rounded-3xl">
                업데이트 예정입니다.
            </div>
        </SettingCard>
    );
}

export function SuperAdminManageSubView({ isDemo }) {
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchAll = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*, companies(name)').order('created_at', { ascending: false });
        setAllProfiles(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleUpdate = async (id, updates) => {
        if (isDemo) return;
        await supabase.from('profiles').update(updates).eq('id', id);
        fetchAll();
    };

    const filtered = allProfiles.filter(p => 
        p.full_name?.toLowerCase().includes(search.toLowerCase()) || 
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.companies?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center">Loading Profiles...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div className="relative w-96">
                    <input 
                        type="text" placeholder="이름, 이메일, 회사명 검색..." 
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</div>
                </div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Total: {allProfiles.length} Users</div>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 italic">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">User / Company</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs">{p.full_name?.[0]}</div>
                                        <div>
                                            <div className="text-xs font-black text-slate-800">{p.full_name}</div>
                                            <div className="text-[10px] font-bold text-slate-400">{p.email} | {p.companies?.name || 'No Company'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={p.plan || 'free'} 
                                        onChange={e => handleUpdate(p.id, { plan: e.target.value })}
                                        className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md outline-none"
                                    >
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                        <option value="ultra">Ultra</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={p.role || 'user'} 
                                        onChange={e => handleUpdate(p.id, { role: e.target.value })}
                                        className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-md outline-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {p.status}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {p.status === 'pending' && (
                                        <button 
                                            onClick={() => handleUpdate(p.id, { status: 'approved' })}
                                            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black hover:bg-emerald-600 transition-all"
                                        >
                                            승인
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
