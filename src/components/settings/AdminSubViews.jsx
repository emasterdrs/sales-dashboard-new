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

export function SuperAdminManageSubView({ isDemo, onImpersonate }) {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div className="relative w-96">
                    <input 
                        type="text" placeholder="이름, 이메일, 회사명 검색..." 
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-bold"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</div>
                </div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Total: {allProfiles.length} Members</div>
            </header>

            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 italic">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">User / Company</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {p.status}
                                    </div>
                                </td>
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
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => onImpersonate(p)}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            View Dashboard
                                        </button>
                                        {p.status === 'pending' && (
                                            <button 
                                                onClick={() => handleUpdate(p.id, { status: 'approved' })}
                                                className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black hover:bg-emerald-600 transition-all"
                                            >
                                                Approve
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SuperAdminDashboardSubView() {
    const [stats, setStats] = useState({ users: 0, companies: 0, inquiries: 0, proUsers: 0 });

    useEffect(() => {
        const fetch = async () => {
            const { count: u } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: c } = await supabase.from('companies').select('*', { count: 'exact', head: true });
            const { count: i } = await supabase.from('inquiries').select('*', { count: 'exact', head: true, filter: 'status.eq.pending' });
            const { count: p } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).or('plan.eq.pro,plan.eq.ultra');
            setStats({ users: u || 0, companies: c || 0, inquiries: i || 0, proUsers: p || 0 });
        };
        fetch();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatSmall title="전체 사용자" value={stats.users} icon={Users} color="indigo" />
            <StatSmall title="등록 회사" value={stats.companies} icon={Building2} color="emerald" />
            <StatSmall title="유료 플랜 이용자" value={stats.proUsers} icon={Settings} color="amber" />
            <StatSmall title="대기 중인 문의" value={stats.inquiries} icon={Clock} color="rose" />
        </div>
    );
}

export function SuperAdminInquiriesSubView() {
    const [items, setItems] = useState([]);
    
    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('inquiries').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
            setItems(data || []);
        };
        fetch();
    }, []);

    return (
        <SettingCard title="글로벌 고객 문의 관리" icon={Clock} desc="모든 회사의 문의 내역을 모니터링하고 답변합니다.">
            <div className="space-y-4">
                {items.map(i => (
                    <div key={i.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${i.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{i.status}</span>
                                <h4 className="text-md font-black text-slate-800 mt-1">{i.title}</h4>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{new Date(i.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-500 font-bold mb-4 line-clamp-2">{i.content}</p>
                        <div className="flex items-center gap-2 text-xs text-indigo-600 font-black">
                            👤 {i.author_name} ({i.email})
                        </div>
                    </div>
                ))}
            </div>
        </SettingCard>
    );
}

export function SuperAdminNoticeSubView({ isDemo }) {
    const [notices, setNotices] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const fetchNotices = async () => {
        const { data } = await supabase.from('settings').select('*').eq('key', 'system_notices').maybeSingle();
        setNotices(data?.data || []);
    };

    useEffect(() => { fetchNotices(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (isDemo || !title || !content) return;
        const newList = [{ id: Date.now(), title, content, date: new Date().toISOString() }, ...notices];
        await supabase.from('settings').upsert({ company_id: 'global', key: 'system_notices', data: newList });
        setNotices(newList);
        setTitle(''); setContent('');
    };

    return (
        <div className="space-y-8">
            <SettingCard title="공지사항 작성" icon={AlertCircle} desc="모든 사용자의 대시보드에 노출될 시스템 공지를 작성합니다.">
                <form onSubmit={handleAdd} className="space-y-4">
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="공지 제목" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none border focus:border-indigo-500 font-bold text-sm" />
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="공지 내용" className="w-full h-32 px-4 py-3 bg-slate-50 rounded-xl outline-none border focus:border-indigo-500 font-bold text-sm" />
                    <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-sm">공지 등록하기</button>
                </form>
            </SettingCard>

            <div className="space-y-4">
                {notices.map(n => (
                    <div key={n.id} className="p-6 bg-white border border-slate-100 rounded-3xl">
                        <h4 className="font-black text-slate-800">{n.title}</h4>
                        <p className="text-sm text-slate-500 font-bold mt-2">{n.content}</p>
                        <div className="text-[10px] text-slate-400 mt-4">{new Date(n.date).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatSmall({ title, value, icon: Icon, color }) {
    const colors = { indigo: 'bg-indigo-50 text-indigo-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600' };
    return (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}><Icon size={20} /></div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</div>
            <div className="text-2xl font-black text-slate-800">{value}</div>
        </div>
    );
}
