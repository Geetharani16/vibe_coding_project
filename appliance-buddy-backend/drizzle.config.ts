import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    host: process.env.DB_HOST?.includes('pooler') 
      ? process.env.DB_HOST 
      : (process.env.DB_HOST || 'localhost').replace('db.', 'aws-0-us-west-1.pooler.'),
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
  },
  // Add SSL for production
  ...(process.env.DB_SSL === 'require' ? { ssl: true } : {}),
} satisfies Config;