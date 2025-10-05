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

// Use the correct connection format
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log(`Attempting to connect to: postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Configure postgres client
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  connect_timeout: 10,
  idle_timeout: 20,
  max: 10,
});

// Test the connection
client`SELECT 1`.then(() => {
  console.log('✅ Database connection successful!');
}).catch((error) => {
  console.error('❌ Database connection failed:', error.message);
  console.error('Error code:', error.code);
});

export const db = drizzle(client, { schema });