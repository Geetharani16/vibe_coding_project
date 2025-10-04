import { pgTable, varchar, text, uuid, timestamp } from 'drizzle-orm/pg-core';
import { appliances } from './appliances.js';

export const supportContacts = pgTable('support_contacts', {
  id: uuid('id').defaultRandom().primaryKey(),
  applianceId: uuid('appliance_id').references(() => appliances.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});