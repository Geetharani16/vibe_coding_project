import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../config/database.js';
import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();
const migrationClient = postgres(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { max: 1 });
async function main() {
    if (!db) {
        console.error('Database connection is not available');
        process.exit(1);
    }
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('Migrations completed!');
    await migrationClient.end();
}
main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map