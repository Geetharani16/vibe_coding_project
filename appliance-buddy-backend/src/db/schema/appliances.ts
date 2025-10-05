import { pgTable, varchar, timestamp, integer, text, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const appliances = pgTable('appliances', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  purchaseDate: timestamp('purchase_date').notNull(),
  warrantyDurationMonths: integer('warranty_duration_months').notNull(),
  serialNumber: varchar('serial_number', { length: 100 }),
  purchaseLocation: varchar('purchase_location', { length: 255 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
});

// Remove the duplicate users definition - it's already imported above