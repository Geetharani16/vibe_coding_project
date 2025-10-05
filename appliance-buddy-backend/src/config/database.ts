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

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log(`Attempting to connect to: postgresql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Configure postgres client with better connection handling
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  connect_timeout: 20,
  idle_timeout: 30,
  max: 5,
  // Improved connection settings
  connection: {
    application_name: 'appliance-buddy-backend'
  }
});

// Test the connection with detailed logging
client`SELECT 1`.then(() => {
  console.log('✅ Database connection successful!');
}).catch((error) => {
  console.error('❌ Database connection failed:', error.message);
  console.error('Error code:', error.code);
  console.error('Host attempted:', process.env.DB_HOST);
  console.error('Port attempted:', process.env.DB_PORT);
});

export const db = drizzle(client, { schema });