import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    host: process.env.DB_HOST || 'db.sgkirxqorrongtknnkzt.supabase.co',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'home-appliance-buddy',
    database: process.env.DB_NAME || 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  },
  verbose: true,
  strict: true,
} satisfies Config;