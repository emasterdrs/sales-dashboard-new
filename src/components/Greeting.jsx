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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn("flex flex-col mb-1", className)}
        >
            <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-[0.1em]">
                    {roleMap[role] || role}
                </span>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 italic">
                    {getGreetingMessage()}
                </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                <span className="text-slate-400 dark:text-slate-500 font-bold">안녕하세요,</span> {name}님
            </h2>
        </motion.div>
    );
}
