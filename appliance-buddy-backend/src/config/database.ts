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

// Enhanced connection configuration with better timeout handling
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  connect_timeout: 20,
  idle_timeout: 30,
  max: 2,
  connection: {
    application_name: 'appliance-buddy-backend'
  },
  // Add retry configuration
  max_lifetime: 60,
  backoff: true,
  keep_alive: 30
});

// Test the connection with detailed logging and retry mechanism
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    const result = await client`SELECT 1`;
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Host attempted:', process.env.DB_HOST);
    console.error('Port attempted:', process.env.DB_PORT);
    
    // Try a simple TCP connection test
    try {
      const net = await import('net');
      const socket = net.createConnection(process.env.DB_PORT, process.env.DB_HOST);
      
      socket.setTimeout(10000); // 10 second timeout
      
      socket.on('connect', () => {
        console.log('✅ TCP connection successful to database server');
        socket.destroy();
      });
      
      socket.on('timeout', () => {
        console.error('❌ TCP connection timed out - network/firewall issue');
        socket.destroy();
      });
      
      socket.on('error', (err) => {
        console.error('❌ TCP connection failed:', err.message);
        socket.destroy();
      });
    } catch (tcpError) {
      console.error('❌ TCP connection test failed:', tcpError.message);
    }
    
    return false;
  }
};

// Run connection test
testConnection().catch(console.error);

export const db = drizzle(client, { schema });