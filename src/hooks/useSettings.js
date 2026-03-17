import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings(companyId) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadSettings = useCallback(async () => {
        if (!companyId) return null;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('settings')
                .select('data')
                .eq('company_id', companyId)
                .maybeSingle();

            if (error) throw error;
            return data?.data || {};
        } catch (e) {
            console.error('Failed to load settings:', e);
            setError(e.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    const saveSettings = useCallback(async (newData) => {
        if (!companyId) return false;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ company_id: companyId, data: newData });

            if (error) throw error;
            
            // Sync to localStorage for legacy components
            localStorage.setItem('dashboard_settings', JSON.stringify(newData));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            setError(e.message);
            return false;
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    return { loadSettings, saveSettings, loading, error };
}
