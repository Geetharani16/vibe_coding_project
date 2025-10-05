import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Check if all required environment variables are present
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Use the direct host without db. prefix
const dbHost = process.env.DB_HOST?.replace('db.', '') || 'sgkirxqorrongtknnkzt.supabase.co';

console.log(`Attempting to connect to: postgresql://${process.env.DB_USER}:***@${dbHost}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Enhanced connection configuration
const client = postgres({
  host: dbHost,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  connect_timeout: 30,
  idle_timeout: 20,
  max: 1,
  connection: {
    application_name: 'appliance-buddy-backend'
  }
});

// Test the connection with detailed logging
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    const result = await client`SELECT 1`;
    console.log('✅ Database connection successful!');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Host attempted:', dbHost);
    console.error('Port attempted:', process.env.DB_PORT);
    return false;
  }
};

// Run connection test
testConnection().catch((error: any) => {
  console.error('❌ Database connection test failed:', error.message);
});

export const db = drizzle(client, { schema });