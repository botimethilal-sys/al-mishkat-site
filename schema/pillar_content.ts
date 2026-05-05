import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pillarContentTypeEnum = pgEnum("pillar_content_type", ["video_link", "pdf"]);

export const pillarContentTable = pgTable("pillar_content", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pillarId: text("pillar_id").notNull(),
  type: pillarContentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPillarContentSchema = createInsertSchema(pillarContentTable).omit({ id: true, createdAt: true });
export type InsertPillarContent = z.infer<typeof insertPillarContentSchema>;
export type PillarContent = typeof pillarContentTable.$inferSelect;
