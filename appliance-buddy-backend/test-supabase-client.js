import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://sgkirxqorrongtknnkzt.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-key-here';

console.log('Testing Supabase client connection...');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('appliances')
      .select('count()', { count: 'exact' });
    
    if (error) {
      console.log('❌ Supabase client connection failed:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('✅ Supabase client connection successful!');
      console.log('Data:', data);
    }
  } catch (error) {
    console.log('❌ Supabase client connection failed with exception:', error.message);
  }
}

testConnection();