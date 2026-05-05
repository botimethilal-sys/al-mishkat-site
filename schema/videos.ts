import { pgTable, text, integer, timestamp, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videoTypeEnum = pgEnum("video_type", ["lecture", "short", "reel"]);

export const videosTable = pgTable("videos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  subjectId: text("subject_id").notNull(),
  type: videoTypeEnum("type").notNull().default("lecture"),
  objectPath: text("object_path").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration").notNull().default(""),
  viewCount: integer("view_count").notNull().default(0),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
