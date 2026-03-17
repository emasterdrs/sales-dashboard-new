import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase Project URL and Anon Key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tfigixxfbybthkfdqnue.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_e754bv0KT2G5BXb3TC-Cqw_tprDtah4';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing. App may crash.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
