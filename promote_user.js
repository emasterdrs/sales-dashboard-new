
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('c:/Users/duri0/Desktop/sales-dashboard-new/.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function promoteUser() {
    console.log('Listing all profiles visible to anon key...');
    
    const { data: profiles, error: findError } = await supabase
        .from('profiles')
        .select('*');

    if (findError) {
        console.error('Error listing profiles:', findError);
        return;
    }

    console.log(`Found ${profiles?.length || 0} profiles.`);
    if (profiles && profiles.length > 0) {
        console.table(profiles);
    }
}

promoteUser();
