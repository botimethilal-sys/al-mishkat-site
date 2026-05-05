import { pgTable, text, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizDifficultyEnum = pgEnum("quiz_difficulty", ["beginner", "intermediate", "advanced"]);

export const quizzesTable = pgTable("quizzes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  subjectId: text("subject_id").notNull(),
  difficulty: quizDifficultyEnum("difficulty").notNull().default("beginner"),
  passThreshold: integer("pass_threshold").notNull().default(70),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  quizId: text("quiz_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true });
export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ id: true, createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
