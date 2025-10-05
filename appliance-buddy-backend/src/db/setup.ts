import { db } from '../config/database.js';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

async function setupDatabase() {
  // Check if database is available
  if (!db) {
    console.error('Database connection is not available');
    throw new Error('Database connection is not available');
  }
  
  try {
    console.log('Creating tables on Supabase...');

    // Create users table first
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    // Update appliances table to include user_id
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS appliances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        purchase_date TIMESTAMP NOT NULL,
        warranty_duration_months INTEGER NOT NULL,
        serial_number VARCHAR(100),
        purchase_location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS support_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appliance_id UUID REFERENCES appliances(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appliance_id UUID REFERENCES appliances(id) ON DELETE CASCADE NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        scheduled_date TIMESTAMP NOT NULL,
        frequency VARCHAR(20) NOT NULL,
        service_provider_name VARCHAR(255),
        service_provider_phone VARCHAR(20),
        service_provider_email VARCHAR(255),
        service_provider_notes TEXT,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'Upcoming' NOT NULL,
        completed_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS linked_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        appliance_id UUID REFERENCES appliances(id) ON DELETE CASCADE NOT NULL,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    console.log('All tables created successfully on Supabase!');
  } catch (error: any) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

setupDatabase();