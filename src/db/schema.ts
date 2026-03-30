import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  date,
  uniqueIndex,
  index,
  pgPolicy,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role").notNull().default("member"),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [uniqueIndex("users_tenant_email_idx").on(table.tenantId, table.email)]
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    ownerId: uuid("owner_id").references(() => users.id),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    source: text("source"),
    status: text("status").default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_leads_tenant").on(table.tenantId)]
);

export const pipelineStages = pgTable("pipeline_stages", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  color: text("color"),
});

export const deals = pgTable(
  "deals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id").references(() => leads.id),
    stageId: uuid("stage_id").references(() => pipelineStages.id),
    ownerId: uuid("owner_id").references(() => users.id),
    title: text("title").notNull(),
    value: numeric("value", { precision: 12, scale: 2 }),
    expectedClose: date("expected_close"),
    status: text("status").default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_deals_tenant").on(table.tenantId),
    index("idx_deals_stage").on(table.stageId),
  ]
);

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    dealId: uuid("deal_id").references(() => deals.id),
    leadId: uuid("lead_id").references(() => leads.id),
    userId: uuid("user_id").references(() => users.id),
    type: text("type").notNull(),
    body: text("body"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_activities_deal").on(table.dealId)]
);
