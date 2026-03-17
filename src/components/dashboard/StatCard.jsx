import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

export function StatCard({ title, value, detail, icon: Icon, color, trend }) {
    const isPositive = trend >= 0;
    const colorMap = {
        indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-500 border-indigo-500/20',
        emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-500 border-emerald-500/20',
        rose: 'from-rose-500/20 to-rose-600/5 text-rose-500 border-rose-500/20',
        amber: 'from-amber-500/20 to-amber-600/5 text-amber-500 border-amber-500/20',
        slate: 'from-slate-500/20 to-slate-600/5 text-slate-500 border-slate-500/20',
        violet: 'from-violet-500/20 to-violet-600/5 text-violet-500 border-violet-500/20',
        blue: 'from-blue-500/20 to-blue-600/5 text-blue-500 border-blue-500/20'
    };

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-[24px] p-5 flex items-center gap-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group overflow-hidden relative"
        >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${colorMap[color] || colorMap.slate} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
            <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${colorMap[color] || colorMap.slate} border shadow-inner transition-all group-hover:rotate-6 duration-500`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</h3>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isPositive ? <TrendingUp size={10} /> : <Activity size={10} />}
                            {(Math.abs(trend) || 0).toFixed(1)}%
                        </div>
                    )}
                </div>
                <p className="text-slate-400 dark:text-slate-400 text-[11px] mt-1.5 font-bold flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    {detail}
                </p>
            </div>
        </motion.div>
    );
}
