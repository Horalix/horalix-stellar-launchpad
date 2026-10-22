import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  intent: text("intent", { enum: ["hospital_demo", "investor_access"] }).notNull(),
  name: text("name").notNull(),
  workEmail: text("work_email").notNull(),
  organization: text("organization").notNull(),
  role: text("role").notNull(),
  country: text("country").notNull(),
  message: text("message"),
  consentVersion: text("consent_version").notNull(),
  sourcePath: text("source_path").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  createdAt: integer("created_at").notNull(),
});

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull().default(1),
});

export const anonymousEvents = sqliteTable("anonymous_events", {
  id: text("id").primaryKey(),
  event: text("event").notNull(),
  path: text("path").notNull(),
  source: text("source").notNull(),
  createdAt: integer("created_at").notNull(),
});
