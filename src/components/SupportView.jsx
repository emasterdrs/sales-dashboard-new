import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, 
    Send, 
    User, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    ArrowLeft,
    Search,
    Filter,
    MoreVertical,
    Reply,
    FileSearch,
    BrainCircuit,
    Database,
    Lock,
    X,
    Key,
    Unlock,
    Mail,
    Eye,
    Plus,
    List,
    ShieldCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export function SupportView({ profile, onBack, triggerToast, isDemo, isGuest }) {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [currentView, setCurrentView] = useState(isGuest ? 'form' : (profile?.role === 'super_admin' ? 'list' : 'welcome')); 
    
    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState(profile?.full_name || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [password, setPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(true); 
    
    // Auth state for private inquiry
    const [authedInquiryId, setAuthedInquiryId] = useState(null);
    const [replyContent, setReplyContent] = useState('');

    const isSuperAdmin = profile?.role === 'super_admin';

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            let query = supabase.from('inquiries').select('*');
            
            // 핵심 보안 로직: 관리자가 아니면 '내 글'만 보임 (다른 사람의 메타데이터조차 전송 안됨)
            if (!isSuperAdmin) {
                const userId = (profile?.id && String(profile?.id).includes('demo')) ? null : profile?.id;
                const userEmail = profile?.email;

                if (userId && userEmail) {
                    query = query.or(`user_id.eq.${userId},email.eq.${userEmail}`);
                } else if (userId) {
                    query = query.eq('user_id', userId);
                } else if (userEmail) {
                    query = query.eq('email', userEmail);
                } else {
                    setInquiries([]);
                    setLoading(false);
                    return;
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setInquiries(data || []);
        } catch (e) {
            console.error('Failed to fetch inquiries:', e);
            setInquiries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        setIsSubmitting(true);
        
        try {
            const userId = (profile?.id && String(profile?.id).includes('demo')) ? null : profile?.id;

            const payload = {
                user_id: userId,
                title,
                content,
                status: 'pending',
                author_name: authorName || profile?.full_name || 'Anonymous',
                email: email || profile?.email,
                password: isPrivate ? password : null,
                is_private: isPrivate
            };

            const { error } = await supabase.from('inquiries').insert([payload]);
            if (error) throw error;

            triggerToast('문의가 정상적으로 접수되었습니다.', 'success');
            resetForm();
            
            if (isGuest) {
                // Guests go back to login or stay on a success screen
                setCurrentView('guest_success');
            } else {
                setCurrentView('list');
                fetchInquiries();
            }
        } catch (e) {
            console.error('Submission Error:', e);
            triggerToast(`문의 접수 중 오류가 발생했습니다. (${e.message})`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setPassword('');
        setIsPrivate(true);
    };

    const handleOpenInquiry = (inquiry) => {
        // 이미 본인 인증(로그인)된 상태에서 본인 글이면 즉시 오픈
        const isOwner = inquiry.user_id === profile?.id || inquiry.email === profile?.email;
        
        if (isSuperAdmin || isOwner || authedInquiryId === inquiry.id) {
            setSelectedInquiry(inquiry);
        } else if (inquiry.is_private) {
            const entered = prompt('비밀번호를 입력해주세요.');
            if (entered === inquiry.password) {
                setAuthedInquiryId(inquiry.id);
                setSelectedInquiry(inquiry);
            } else if (entered !== null) {
                alert('비밀번호가 일치하지 않습니다.');
            }
        } else {
            setSelectedInquiry(inquiry);
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) return;
        try {
            const { error } = await supabase
                .from('inquiries')
                .update({ 
                    reply: replyContent, 
                    status: 'completed',
                    replied_at: new Date().toISOString(),
                    replied_by: profile?.id
                })
                .eq('id', selectedInquiry.id);
            
            if (error) throw error;
            setReplyContent('');
            setSelectedInquiry(null);
            fetchInquiries();
            triggerToast('답변이 등록되었습니다.', 'success');
        } catch (e) {
            console.error('Reply error:', e);
            triggerToast('답변 등록 중 오류가 발생했습니다.', 'error');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header 섹션 */}
            <header className="relative group overflow-hidden rounded-[40px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex items-center gap-6">
                    <button 
                        onClick={onBack}
                        className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-lg ring-4 ring-indigo-500/10">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                                1:1 Safe Support
                            </h2>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-tight">
                            {isSuperAdmin ? '통합 문의 관리 시스템 (모든 사용자의 상담 내역)' : '작성하신 문의는 본인과 관리자만 열람할 수 있는 안전한 1:1 상담입니다.'}
                        </p>
                    </div>
                </div>

                <div className="relative flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-white/5">
                    {!isGuest && (
                        <button 
                            onClick={() => setCurrentView('list')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${currentView === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List size={14} /> 상담 리스트
                        </button>
                    )}
                    {!isSuperAdmin && (
                        <button 
                            onClick={() => setCurrentView('form')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${currentView === 'form' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Plus size={14} /> {isGuest ? '문의 작성하기' : '신규 상담 신청'}
                        </button>
                    )}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {currentView === 'guest_success' ? (
                    <motion.div 
                        key="guest_success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 p-12 text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">문의 접수 완료!</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold">
                                보내주신 문의가 정상적으로 접수되었습니다.<br/>
                                입력하신 이메일({email})로 검토 후 답변을 드릴 예정입니다.
                            </p>
                        </div>
                        <button 
                            onClick={onBack}
                            className="px-10 py-4 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
                        >
                            로그인 화면으로 돌아가기
                        </button>
                    </motion.div>
                ) : currentView === 'welcome' && !isSuperAdmin ? (
                    <motion.div 
                        key="welcome"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 p-12 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-20 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                            <BrainCircuit size={400} />
                        </div>
                        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-10">
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] flex items-center justify-center text-indigo-600 mx-auto group-hover:rotate-12 transition-transform duration-500">
                                <Lock size={48} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">1:1 Private Center</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                    다른 사용자의 게시글은 노출되지 않는 고립된 상담 시스템입니다.<br/>
                                    {profile?.full_name}님께서 남기신 문의와 관리자의 답변만 이 공간에서 안전하게 확인 가능합니다.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button 
                                    onClick={() => setCurrentView('form')}
                                    className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} /> 상담 신청하기
                                </button>
                                <button 
                                    onClick={() => setCurrentView('list')}
                                    className="w-full sm:w-auto px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    나의 상담 내역 ({inquiries.length})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : currentView === 'form' ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">
                                <Mail size={14} /> Contact Information
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상담자 성함</label>
                                    <input 
                                        type="text" required value={authorName}
                                        onChange={(e) => setAuthorName(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-700 dark:text-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">답변 받을 이메일</label>
                                    <input 
                                        type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-700 dark:text-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상담 제목</label>
                                <input 
                                    type="text" required value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="어떤 점을 도와드릴까요?"
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-700 dark:text-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상담 내용</label>
                                <textarea 
                                    required rows={6} value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm font-black text-slate-700 dark:text-white transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-all ${isPrivate ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            <Lock size={16} />
                                        </div>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">비밀 상담 (로그인 없이 확인 시 필요)</span>
                                    </div>
                                    <button 
                                        type="button" onClick={() => setIsPrivate(!isPrivate)}
                                        className={`w-14 h-7 rounded-full transition-all relative ${isPrivate ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${isPrivate ? 'left-8' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" disabled={isSubmitting}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest"
                            >
                                {isSubmitting ? '전송 중...' : '상담 신청 완료'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 whitespace-nowrap">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isSuperAdmin ? 'Title (Admin Mode)' : '나의 상담명'}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{isSuperAdmin ? 'Author' : '본인 확인'}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Secure Fetching...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : inquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-300">
                                                        <ShieldCheck size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">{isSuperAdmin ? '상담 내역이 없습니다.' : '다른 사람의 글은 보이지 않습니다. 본인의 상담 내역이 없습니다.'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : inquiries.map((item) => {
                                        return (
                                            <motion.tr 
                                                key={item.id}
                                                whileHover={{ backgroundColor: 'rgba(99,102,241,0.02)' }}
                                                className="group cursor-pointer"
                                                onClick={() => handleOpenInquiry(item)}
                                            >
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(item.status)}`}>
                                                        {item.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                        {item.status === 'completed' ? '답변완료' : '검토중'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                                                            {item.title}
                                                        </span>
                                                        <Lock size={12} className="text-indigo-500/30" />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${ (item.is_guest || !item.user_id) ? 'bg-slate-400' : 'bg-indigo-500'}`}>
                                                            { (item.is_guest || !item.user_id) ? <Mail size={10} /> : <User size={10} />}
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                                                            {item.author_name}
                                                            {(item.is_guest || !item.user_id) && <span className="ml-2 text-[9px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md text-slate-400 uppercase tracking-tighter">Guest</span>}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="text-[11px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {!isSuperAdmin && inquiries.length > 0 && (
                            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-500/5 text-center">
                                <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest">
                                    상담 리스트에는 로그인하신 계정 정보(ID 또는 메일)와 일치하는 상담만 표시됩니다.
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal - Detail */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInquiry(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden border border-white/10"
                        >
                            <div className="p-10 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-start">
                                <div className="space-y-3">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(selectedInquiry.status)}`}>
                                        {selectedInquiry.status === 'completed' ? '1:1 상담 답변 완료' : '상담 검토 중'}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedInquiry.title}</h3>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                                        <div className="flex items-center gap-1.5"><User size={12} /> {selectedInquiry.author_name}</div>
                                        <div className="flex items-center gap-1.5"><Mail size={12} /> {selectedInquiry.email}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedInquiry(null)} className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">상담 신청 내용</div>
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl text-[15px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic border border-slate-100 dark:border-white/5">
                                        "{selectedInquiry.content}"
                                    </div>
                                </div>

                                {(selectedInquiry.reply || isSuperAdmin) && (
                                    <div className="space-y-4 pt-10 border-t border-slate-100 dark:border-white/5">
                                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">관리자 전문 답변</div>
                                        {selectedInquiry.reply ? (
                                            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl text-[15px] font-bold text-emerald-900 dark:text-emerald-100 leading-relaxed">
                                                {selectedInquiry.reply}
                                                <div className="mt-6 pt-4 border-t border-emerald-200/30 text-[10px] font-black text-emerald-600/60 uppercase tracking-widest flex items-center justify-between">
                                                    <span>Replied at: {new Date(selectedInquiry.replied_at).toLocaleString()}</span>
                                                    <span className="flex items-center gap-1">
                                                        <ShieldCheck size={12} /> Verified Admin
                                                    </span>
                                                </div>
                                            </div>
                                        ) : isSuperAdmin && (
                                            <div className="space-y-4">
                                                <textarea 
                                                    rows={5} value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                                                    placeholder="답변을 입력하여 상담을 완료하세요..."
                                                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-3xl text-sm font-black outline-none focus:border-emerald-500"
                                                />
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={handleReply}
                                                        className="flex-1 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20"
                                                    >
                                                        Submit Resolution & Mail Alert
                                                    </button>
                                                    {(selectedInquiry.is_guest || !selectedInquiry.user_id) && (
                                                        <a 
                                                            href={`mailto:${selectedInquiry.email}?subject=문의하신 내용에 대해 답변드립니다&body=안녕하세요 ${selectedInquiry.author_name}님,%0D%0A%0D%0A문의하신 내용: "${selectedInquiry.content}"%0D%0A%0D%0A답변 내용:%0D%0A${replyContent || '[여기에 내용을 입력하세요]'}`}
                                                            className="px-8 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-2 hover:bg-slate-200 transition-all"
                                                        >
                                                            <Mail size={18} /> Direct Email
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
