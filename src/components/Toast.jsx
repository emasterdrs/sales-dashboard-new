import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export function Toast({ toast, onClose }) {
    useEffect(() => {
        if (toast) {
            // Give more time for errors or warnings to be read
            const duration = (toast.type === 'error' || toast.type === 'warning') ? 3000 : 1500;
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [toast, onClose]);

    if (!toast) return null;

    const iconMap = {
        success: <CheckCircle2 className="text-emerald-500" size={18} />,
        error: <AlertCircle className="text-rose-500" size={18} />,
        warning: <AlertCircle className="text-amber-500" size={18} />,
        info: <Info className="text-indigo-500" size={18} />,
    };

    const bgMap = {
        success: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20',
        error: 'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20',
        warning: 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20',
        info: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20',
    };

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[90vw] pointer-events-none px-4">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } }}
                        className={`pointer-events-auto flex items-start justify-center gap-3.5 py-4 px-7 rounded-[24px] border shadow-2xl backdrop-blur-md ${bgMap[toast.type || 'info']}`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {iconMap[toast.type || 'info']}
                        </div>
                        <span className="text-[14px] font-black tracking-tight text-slate-800 dark:text-white leading-normal max-w-[400px]">
                            {toast.message}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
