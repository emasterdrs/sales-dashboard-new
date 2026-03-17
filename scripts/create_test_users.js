import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfigixxfbybthkfdqnue.supabase.co';
const supabaseKey = 'sb_publishable_e754bv0KT2G5BXb3TC-Cqw_tprDtah4';
const supabase = createClient(supabaseUrl, supabaseKey);

const testUsers = [
    { email: 'free@test.com', password: 'password123' },
    { email: 'pro@test.com', password: 'password123' },
    { email: 'enterprise@test.com', password: 'password123' }
];

async function createUsers() {
    for (const user of testUsers) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: user.email,
                password: user.password,
            });
            if (error) {
                console.log(`User ${user.email} error:`, error.message);
            } else {
                console.log(`User ${user.email} created successfully.`);
            }
        } catch (e) {
            console.log(`Failed for ${user.email}:`, e.message);
        }
    }
}

createUsers();
