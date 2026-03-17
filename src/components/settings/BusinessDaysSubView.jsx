import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, CalendarDays, ChevronDown, Info } from 'lucide-react';
import { getYearlyCalendarData } from '../../lib/dateUtils';
import { useSettings } from '../../hooks/useSettings';

export function BusinessDaysSubView({ year, profile, isDemo }) {
    const { loadSettings, saveSettings } = useSettings(profile?.company_id);
    const calendarDataRaw = useMemo(() => getYearlyCalendarData(year), [year]);
    const [editingMonth, setEditingMonth] = useState(null);
    const [holidayNames, setHolidayNames] = useState({});
    const [toggledDays, setToggledDays] = useState({});

    useEffect(() => {
        const fetch = async () => {
            const settings = await loadSettings();
            if (settings) {
                if (settings[`holidayNames_${year}`]) setHolidayNames(settings[`holidayNames_${year}`]);
                if (settings[`toggledDays_${year}`]) setToggledDays(settings[`toggledDays_${year}`]);
            }
        };
        fetch();
    }, [year, loadSettings]);

    const toggleEditAndSave = async (month, isCurrentlyEditing) => {
        if (isCurrentlyEditing) {
            if (isDemo) return setEditingMonth(null);
            const current = await loadSettings() || {};
            const newData = {
                ...current,
                [`holidayNames_${year}`]: holidayNames,
                [`toggledDays_${year}`]: toggledDays
            };
            const success = await saveSettings(newData);
            if (!success) alert('설정 저장 중 오류가 발생했습니다.');
            setEditingMonth(null);
        } else {
            setEditingMonth(month);
        }
    };

    const calendarData = useMemo(() => {
        return calendarDataRaw.map(m => ({
            ...m,
            days: m.days.map(d => {
                const isToggled = toggledDays[d.date] !== undefined;
                let isBusinessDay = d.isBusinessDay;
                let isHoliday = d.isHoliday;
                let currentName = holidayNames[d.date] !== undefined ? holidayNames[d.date] : d.holidayName;

                if (isToggled) {
                    isBusinessDay = toggledDays[d.date];
                    isHoliday = !isBusinessDay && !d.isWeekend;
                    if (!isBusinessDay && !currentName && !d.isWeekend) {
                        currentName = '임시 지정 휴일';
                    }
                }
                return { ...d, isBusinessDay, isHoliday, holidayName: currentName };
            })
        }));
    }, [calendarDataRaw, toggledDays, holidayNames]);

    const handleNameChange = (date, name) => {
        setHolidayNames(prev => ({ ...prev, [date]: name }));
    };

    const handleDayToggle = (date, currentIsBusinessDay) => {
        setToggledDays(prev => ({ ...prev, [date]: !currentIsBusinessDay }));
        if (currentIsBusinessDay && !holidayNames[date]) {
            setHolidayNames(prev => ({ ...prev, [date]: '임시 지정 휴일' }));
        }
    };

    return (
        <div className="space-y-12">
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm p-4 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{year}년 월별 영업일 요약</h3>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-100">
                                {calendarData.map(m => (
                                    <th key={m.month} className="py-4 px-2 text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0">
                                        {m.month}월
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                {calendarData.map(m => {
                                    const bizDays = m.days.filter(d => d.isBusinessDay).length;
                                    return (
                                        <td key={m.month} className="py-6 px-2 border-r border-slate-100 last:border-r-0 group">
                                            <span className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{bizDays}</span>
                                            <span className="text-[10px] md:text-xs text-slate-300 ml-1 font-bold">일</span>
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {calendarData.map(({ month, days }) => {
                const totalBizDays = days.filter(d => d.isBusinessDay).length;
                const holidays = days.filter(d => !d.isBusinessDay && (d.isHoliday || d.isWeekend));
                const isEditing = editingMonth === month;

                return (
                    <div key={month} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                        <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-black text-indigo-600 shadow-sm shrink-0">
                                    {month}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{year}년 {month}월</h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Monthly Calendar</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-tighter">Total Business Days</span>
                                <span className="text-3xl font-black text-indigo-600">{totalBizDays} <span className="text-lg text-slate-300">Days</span></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3">
                            <div className="lg:col-span-2 p-4 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-100">
                                <div className="grid grid-cols-7 gap-1 md:gap-2">
                                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                                        <div key={d} className={`text-center py-2 text-xs font-black uppercase tracking-widest ${d === '일' ? 'text-rose-500' : d === '토' ? 'text-blue-500' : 'text-slate-400'}`}>
                                            {d}
                                        </div>
                                    ))}
                                    {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {days.map(d => {
                                        const displayName = holidayNames[d.date] !== undefined ? holidayNames[d.date] : d.holidayName;
                                        return (
                                            <div
                                                key={d.date}
                                                onClick={() => isEditing && handleDayToggle(d.date, d.isBusinessDay)}
                                                className={`
                                                    relative h-14 md:h-16 rounded-lg md:rounded-xl flex flex-col items-center justify-center border transition-all
                                                    ${d.isBusinessDay ? 'bg-white border-transparent hover:border-indigo-200 hover:bg-indigo-50/30' :
                                                        d.isHoliday ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                                            'bg-slate-50 border-slate-100 text-slate-400'}
                                                    ${isEditing ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md' : ''}
                                                `}
                                            >
                                                <span className="text-xs md:text-sm font-black">{d.day}</span>
                                                {displayName && !d.isBusinessDay && <span className="text-[6px] md:text-[8px] font-bold mt-0.5 md:mt-1 text-center truncate px-0.5 md:px-1 w-[95%]">{displayName}</span>}
                                                {d.isBusinessDay && <div className="absolute top-1 right-1 w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 md:p-8 bg-slate-50/30">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={14} className="text-indigo-400" />
                                        영업일 제외 상세 내역
                                    </h4>
                                    <button
                                        onClick={() => toggleEditAndSave(month, isEditing)}
                                        className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all shadow-sm border ${isEditing
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-indigo-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {isEditing ? '저장' : '편집'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {holidays.length > 0 ? holidays.map(h => (
                                        <div key={h.date} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right-2">
                                            <div className="flex items-center gap-3 flex-1 mr-2">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${h.isHoliday ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {h.day}
                                                </div>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={holidayNames[h.date] !== undefined ? holidayNames[h.date] : (h.holidayName || '')}
                                                        onChange={(e) => handleNameChange(h.date, e.target.value)}
                                                        className="w-full text-xs font-black text-slate-700 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-1 outline-none"
                                                        placeholder="제외 사유 입력"
                                                    />
                                                ) : (
                                                    <span className="text-xs font-black text-slate-700">{holidayNames[h.date] !== undefined ? holidayNames[h.date] : h.holidayName}</span>
                                                )}
                                            </div>
                                            {!isEditing && <span className="text-[10px] text-slate-300 font-bold shrink-0">{h.date}</span>}
                                        </div>
                                    )) : (
                                        <div className="text-center py-10">
                                            <p className="text-xs text-slate-400 font-bold italic">제외된 날짜가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
