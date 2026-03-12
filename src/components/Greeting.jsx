import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function Greeting({ name, role, className }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000); // 1분마다 업데이트
        return () => clearInterval(timer);
    }, []);

    const getGreetingMessage = () => {
        const hours = time.getHours();
        if (hours >= 5 && hours < 11) return '상쾌한 아침입니다';
        if (hours >= 11 && hours < 14) return '즐거운 점심 시간입니다';
        if (hours >= 14 && hours < 17) return '나른함을 이겨낼 오후입니다';
        if (hours >= 17 && hours < 21) return '오늘 하루도 수고 많으셨습니다';
        return '고요한 밤입니다';
    };

    const roleMap = {
        'super_admin': '총괄 관리자',
        'admin': '관리자',
        'user': '영업 사원'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex flex-col mb-2", className)}
        >
            <div className="flex items-center gap-3 mb-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20 shadow-sm transition-all hover:shadow-indigo-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {roleMap[role] || role} Status
                    </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-tight">
                    • {getGreetingMessage()}
                </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                {name} <span className="text-slate-400 dark:text-slate-500 font-bold tracking-tight">님, 반갑습니다. </span>
                <span className="inline-block animate-bounce-slow">✨</span>
            </h2>
        </motion.div>
    );
}
