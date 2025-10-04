import { pgTable, varchar, timestamp, text, uuid } from 'drizzle-orm/pg-core';
import { appliances } from './appliances.js';

export const maintenanceTasks = pgTable('maintenance_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  applianceId: uuid('appliance_id').references(() => appliances.id, { onDelete: 'cascade' }).notNull(),
  taskName: varchar('task_name', { length: 255 }).notNull(),
  scheduledDate: timestamp('scheduled_date').notNull(),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  serviceProviderName: varchar('service_provider_name', { length: 255 }),
  serviceProviderPhone: varchar('service_provider_phone', { length: 20 }),
  serviceProviderEmail: varchar('service_provider_email', { length: 255 }),
  serviceProviderNotes: text('service_provider_notes'),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).notNull().default('Upcoming'),
  completedDate: timestamp('completed_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});