import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    host: 'aws-0-us-west-1.pooler.supabase.com',
    port: 6543,
    user: 'postgres.sgkirxqorrongtknnkzt',
    password: 'home-appliance-buddy',
    database: 'postgres',
  },
  verbose: true,
  strict: true,
} satisfies Config;