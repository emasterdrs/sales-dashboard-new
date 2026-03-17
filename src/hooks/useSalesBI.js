import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SalesBI } from '../data/mockEngine';
import { generateFullDataset } from '../data/generateSalesData';
import { getYearlyCalendarData } from '../lib/dateUtils';

export function useSalesBI(profile, isDemo) {
    const [masterData, setMasterData] = useState({ actual: [], target: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const fetchCloudData = async () => {
        if (!profile?.company_id || profile.status !== 'approved') return;
        setIsLoading(true);
        try {
            const { data: actual } = await supabase.from('sales_actual').select('*').eq('company_id', profile.company_id);
            const { data: target } = await supabase.from('sales_target').select('*').eq('company_id', profile.company_id);
            
            const mappedActual = (actual || []).map(r => ({
                '년도월': r.year_month, '영업팀': r.team_name, '영업사원명': r.person_name,
                '거래처코드': r.customer_code, '거래처명': r.customer_name, '품목유형': r.type_name,
                '품목코드': r.item_code, '품목명': r.item_name, '금액': r.amount, '매출금액': r.amount
            }));

            const mappedTarget = (target || []).map(r => ({
                '년도월': r.year_month, '영업팀': r.team_name, '영업사원명': r.person_name,
                '금액': r.amount, '목표금액': r.amount
            }));

            setMasterData({ actual: mappedActual, target: mappedTarget });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isDemo) fetchCloudData();
    }, [profile, isDemo]);

    const [cloudSettings, setCloudSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!profile?.company_id) return;
            const { data } = await supabase.from('settings').select('data').eq('company_id', profile.company_id).maybeSingle();
            if (data?.data) setCloudSettings(data.data);
        };
        if (!isDemo) fetchSettings();
    }, [profile, isDemo]);

    const bizDayInfo = useMemo(() => {
        if (!selectedMonth.includes('-')) return { currentBusinessDay: 1, totalBusinessDays: 20 };
        const [year, month] = selectedMonth.split('-').map(Number);
        const calendar = getYearlyCalendarData(year);
        const monthData = calendar.find(m => m.month === month) || { days: [] };
        
        const toggledDays = cloudSettings?.[`toggledDays_${year}`] || {};

        const processed = monthData.days.map(d => ({
            ...d, isBusinessDay: toggledDays[d.date] !== undefined ? toggledDays[d.date] : d.isBusinessDay
        }));

        const total = processed.filter(d => d.isBusinessDay).length || 20;
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayIso = yesterday.toISOString().split('T')[0];

        const current = (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
            ? total : (year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1))
            ? 0 : processed.filter(d => d.isBusinessDay && d.date <= yesterdayIso).length;

        return { currentBusinessDay: current, totalBusinessDays: total };
    }, [selectedMonth]);

    const bi = useMemo(() => {
        let actual = masterData.actual;
        let target = masterData.target;
        if (isDemo || (!actual.length && !target.length)) {
            const demo = generateFullDataset(isDemo);
            actual = demo.actual; target = demo.target;
        }
        return new SalesBI(actual, target, [], [], profile?.plan || 'free', isDemo);
    }, [masterData, profile?.plan, isDemo]);

    return { bi, masterData, setMasterData, selectedMonth, setSelectedMonth, bizDayInfo, isLoading, refresh: fetchCloudData };
}
