import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

// Try different endpoints
const endpoints = [
  'sgkirxqorrongtknnkzt.supabase.co', // Project endpoint
  'aws-0-us-west-1.supabase.co', // AWS region endpoint
  'db.sgkirxqorrongtknnkzt.supabase.co' // Database endpoint
];

async function testEndpoint(host) {
  console.log(`\n--- Testing endpoint: ${host} ---`);
  
  const client = postgres({
    host: host,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    },
    connect_timeout: 15,
    idle_timeout: 10,
    max: 1
  });

  try {
    console.log('Attempting database query...');
    const result = await client`SELECT current_database(), current_user, version()`;
    console.log('✅ Connection successful!');
    console.log('Current database:', result[0].current_database);
    console.log('Current user:', result[0].current_user);
    console.log('Version:', result[0].version);
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
async function testAllEndpoints() {
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) {
      console.log(`\n🎉 Successful connection with endpoint: ${endpoint}`);
      break;
    }
  }
}

testAllEndpoints();