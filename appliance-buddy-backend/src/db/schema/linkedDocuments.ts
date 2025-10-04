import { pgTable, varchar, uuid, timestamp } from 'drizzle-orm/pg-core';
import { appliances } from './appliances.js';

export const linkedDocuments = pgTable('linked_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  applianceId: uuid('appliance_id').references(() => appliances.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});