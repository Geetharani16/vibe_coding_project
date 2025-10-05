import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

console.log('Testing Supabase connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('Connection string:', connectionString.replace(process.env.DB_PASSWORD, '***'));

// Test different connection approaches
const testEndpoints = [
  { host: process.env.DB_HOST, description: 'Current configuration' },
  { host: 'sgkirxqorrongtknnkzt.supabase.co', description: 'Direct project endpoint' },
  { host: 'aws-0-us-west-1.supabase.co', description: 'AWS region endpoint' }
];

async function testConnection(host, description) {
  console.log(`\n--- Testing ${description} ---`);
  console.log('Host:', host);
  
  const testConnectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${host}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  
  const client = postgres(testConnectionString, {
    ssl: { rejectUnauthorized: false },
    connect_timeout: 15
  });

  try {
    const result = await client`SELECT current_database(), current_user, version()`;
    console.log('✅ Connection successful!');
    console.log('Current database:', result[0].current_database);
    console.log('Current user:', result[0].current_user);
    return true;
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('Error:', error.message);
    console.log('Error code:', error.code);
    return false;
  } finally {
    await client.end();
  }
}

// Test each endpoint
for (const { host, description } of testEndpoints) {
  const success = await testConnection(host, description);
  if (success) {
    console.log(`\n🎉 Successful connection method: ${description}`);
    break;
  }
}

console.log('\n--- Test completed ---');