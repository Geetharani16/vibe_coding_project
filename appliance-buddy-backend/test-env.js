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

const client = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false
  },
  connect_timeout: 10,
});

try {
  console.log('Attempting to connect...');
  const result = await client`SELECT current_database(), current_user, version()`;
  console.log('✅ Connection successful!');
  console.log('Current database:', result[0].current_database);
  console.log('Current user:', result[0].current_user);
  console.log('PostgreSQL version:', result[0].version);
} catch (error) {
  console.log('❌ Connection failed!');
  console.log('Error code:', error.code);
  console.log('Error message:', error.message);
  console.log('Full error:', error);
} finally {
  await client.end();
}