import { pgTable, text, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pdfsTable = pgTable("pdfs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  subjectId: text("subject_id").notNull(),
  category: text("category").notNull().default("general"),
  pageCount: integer("page_count").notNull().default(0),
  fileSize: text("file_size").notNull().default(""),
  objectPath: text("object_path").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPdfSchema = createInsertSchema(pdfsTable).omit({ id: true, createdAt: true });
export type InsertPdf = z.infer<typeof insertPdfSchema>;
export type Pdf = typeof pdfsTable.$inferSelect;
