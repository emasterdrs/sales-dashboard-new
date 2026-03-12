
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Manually parse .env since we're in a script
const envFile = fs.readFileSync('c:/Users/duri0/Desktop/sales-dashboard-new/.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('*');
    
    if (compError) {
        console.error('Error fetching companies:', compError);
    } else {
        console.log('Companies:');
        console.table(companies);
    }

    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*');
    
    if (profError) {
        console.error('Error fetching profiles:', profError);
    } else {
        console.log('Profiles:');
        console.table(profiles);
    }
}

listUsers();
