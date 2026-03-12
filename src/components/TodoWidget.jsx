import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';

export function TodoWidget({ className }) {
    const [todos, setTodos] = useState(() => {
        const saved = localStorage.getItem('dashboard-todos');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');

    useEffect(() => {
        localStorage.setItem('dashboard-todos', JSON.stringify(todos));
    }, [todos]);

    const addTodo = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
        setInput('');
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <div className={cn("bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full min-h-[400px]", className)}>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-wider">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                        <ClipboardList size={22} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    판매 목표 및 실적 메모
                </h3>
                <span className="text-[10px] font-black px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-white/5 shadow-sm">
                    {todos.filter(t => !t.completed).length} items left
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {todos.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700 py-10"
                        >
                            <ClipboardList size={64} strokeWidth={1} className="mb-4 opacity-10" />
                            <p className="text-sm font-bold uppercase tracking-widest italic">No memos found</p>
                        </motion.div>
                    )}
                    {todos.map(todo => (
                        <motion.div
                            key={todo.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all shadow-sm"
                        >
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={cn(
                                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    todo.completed 
                                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                                        : "border-slate-200 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-slate-900"
                                )}
                            >
                                {todo.completed && <Check size={14} className="text-white font-black" />}
                            </button>
                            <span className={cn(
                                "flex-1 text-[15px] font-bold transition-all tracking-tight",
                                todo.completed ? "text-slate-400 line-through decoration-slate-300 dark:decoration-slate-700" : "text-slate-700 dark:text-slate-200"
                            )}>
                                {todo.text}
                            </span>
                            <button
                                onClick={() => removeTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <form onSubmit={addTodo} className="mt-8 relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="새로운 판매 관련 메모를 입력하세요..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 rounded-2xl px-6 py-4 text-[15px] font-bold outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all text-slate-700 dark:text-slate-100 shadow-inner"
                />
                <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </form>
        </div>
    );
}
