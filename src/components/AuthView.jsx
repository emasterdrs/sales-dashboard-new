import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, LogIn, UserPlus, ArrowRight, ShieldCheck, Building2, Smartphone, CheckCircle2, MessageSquare } from 'lucide-react';

export function AuthView({ onLoginSuccess, onDemoLogin, onGuestSupport }) {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');

    const translateError = (message) => {
        if (!message) return '알 수 없는 오류가 발생했습니다.';
        if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
        if (message.includes('Email not confirmed')) return '이메일 인증이 필요합니다.';
        if (message.includes('User already registered')) return '이미 가입된 이메일입니다.';
        if (message.includes('Password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.';
        return message;
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: loginErr } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginErr) throw loginErr;
            if (data.user) onLoginSuccess(data.user);
        } catch (err) {
            setError(translateError(err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Auth Signup
            const { data, error: signupErr } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone
                    }
                }
            });

            if (signupErr) throw signupErr;

            if (data.user) {
                setSuccessMsg('✨ 환영합니다! 회원가입이 완료되었습니다. 아래에서 로그인한 후 대시보드를 바로 시작해보세요.');
                setMode('login');
                setTimeout(() => setSuccessMsg(null), 8000);
            }
        } catch (err) {
            setError(translateError(err.message));
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 -right-24 w-80 h-80 bg-violet-500 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-200/60 overflow-hidden relative z-10"
            >
                <div className="p-8 md:p-12">
                    <div className="flex justify-center mb-8">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2 uppercase italic">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                            {mode === 'login' ? '클라우드 매출 관리 대시보드' : '지금 바로 사업 성장을 시작하세요'}
                        </p>
                    </div>

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 mb-8 bg-emerald-50/80 border border-emerald-200 rounded-[20px] flex items-center gap-4 shadow-sm"
                        >
                            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shrink-0">
                                <CheckCircle2 size={24} strokeWidth={3} />
                            </div>
                            <p className="text-[13px] font-black leading-relaxed text-emerald-800">{successMsg}</p>
                        </motion.div>
                    )}

                    <form onSubmit={mode === 'login' ? handleEmailLogin : handleSignup} className="space-y-5">
                        {mode === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="홍길동"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 shadow-inner"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="010-1234-5678"
                                            value={phone}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/[^0-9]/g, '');
                                                if (val.length <= 3) {
                                                    setPhone(val);
                                                } else if (val.length <= 7) {
                                                    setPhone(val.slice(0, 3) + '-' + val.slice(3));
                                                } else {
                                                    setPhone(val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11));
                                                }
                                            }}
                                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 shadow-inner"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 shadow-inner"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-xs font-bold text-rose-600 leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Login' : 'Create Account'}
                                    <ArrowRight size={18} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4 italic">Experience Dashboard (No Login Required)</p>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: 'free', label: 'FREE 체험하기', color: 'slate', desc: '기본 기능 체험' },
                                { id: 'pro', label: 'PRO 체험하기', color: 'indigo', desc: 'AI 분석 & 예측' },
                                { id: 'ultra', label: 'ULTRA 체험하기', color: 'purple', desc: '커스텀 솔루션' }
                            ].map((test) => (
                                <button
                                    key={test.id}
                                    type="button"
                                    onClick={() => onDemoLogin(test.id)}
                                    className={`w-full py-3.5 px-6 rounded-2xl text-[12px] font-black border transition-all flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0
                                        ${test.color === 'indigo' ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-100' :
                                          test.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-purple-200' : 
                                          'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span>{test.label}</span>
                                    <div className="flex items-center gap-2 opacity-80 text-[10px]">
                                        {test.desc}
                                        <ArrowRight size={12} />
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold text-center mt-3 uppercase tracking-tighter">실제 결제 없이 모든 기능을 둘러볼 수 있습니다.</p>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'signup' : 'login');
                                setError(null);
                                setSuccessMsg(null);
                            }}
                            className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors"
                        >
                            {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                        </button>
                        
                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                            <div className="h-[1px] flex-1 bg-slate-100" />
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Or</span>
                            <div className="h-[1px] flex-1 bg-slate-100" />
                        </div>

                        <button
                            type="button"
                            onClick={() => onGuestSupport && onGuestSupport()}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-[11px] font-black transition-all border border-transparent hover:border-indigo-100"
                        >
                            <MessageSquare size={14} />
                            문의하기 (비회원)
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 py-6 px-12 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Building2 size={12} />
                        Cloud Multi-Tenant
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
            </motion.div>
        </div>
    );
}
