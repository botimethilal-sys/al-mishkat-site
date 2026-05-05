import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  videosTable, pdfsTable, insertVideoSchema, insertPdfSchema,
  quizzesTable, quizQuestionsTable, insertQuizSchema, insertQuizQuestionSchema,
  questionsTable, pillarContentTable, insertPillarContentSchema,
  settingsTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/admin/auth", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) { res.status(500).json({ error: "Admin password not configured" }); return; }
  if (password === adminPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Incorrect password" });
  }
});

// ── Videos ────────────────────────────────────────────────────────────────────
router.get("/admin/videos", async (_req, res) => {
  const videos = await db.select().from(videosTable).orderBy(videosTable.createdAt);
  res.json(videos);
});

router.post("/admin/videos", async (req, res) => {
  const parsed = insertVideoSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid video data", details: parsed.error.issues }); return; }
  const [video] = await db.insert(videosTable).values(parsed.data).returning();
  res.status(201).json(video);
});

router.delete("/admin/videos/:videoId", async (req, res) => {
  await db.delete(videosTable).where(eq(videosTable.id, req.params.videoId));
  res.json({ success: true });
});

// ── PDFs ──────────────────────────────────────────────────────────────────────
router.get("/admin/pdfs", async (_req, res) => {
  const pdfs = await db.select().from(pdfsTable).orderBy(pdfsTable.createdAt);
  res.json(pdfs);
});

router.post("/admin/pdfs", async (req, res) => {
  const parsed = insertPdfSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid PDF data", details: parsed.error.issues }); return; }
  const [pdf] = await db.insert(pdfsTable).values(parsed.data).returning();
  res.status(201).json(pdf);
});

router.delete("/admin/pdfs/:pdfId", async (req, res) => {
  await db.delete(pdfsTable).where(eq(pdfsTable.id, req.params.pdfId));
  res.json({ success: true });
});

// ── Pillar content (video links + PDFs) ───────────────────────────────────────
router.get("/admin/pillar-content", async (_req, res) => {
  const content = await db.select().from(pillarContentTable).orderBy(pillarContentTable.createdAt);
  res.json(content);
});

router.post("/admin/pillar-content", async (req, res) => {
  const parsed = insertPillarContentSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid pillar content data", details: parsed.error.issues }); return; }
  const [item] = await db.insert(pillarContentTable).values(parsed.data).returning();
  res.status(201).json(item);
});

router.delete("/admin/pillar-content/:id", async (req, res) => {
  await db.delete(pillarContentTable).where(eq(pillarContentTable.id, req.params.id));
  res.json({ success: true });
});

// ── Quizzes ───────────────────────────────────────────────────────────────────
router.get("/admin/quizzes", async (_req, res) => {
  const quizzes = await db.select().from(quizzesTable).orderBy(quizzesTable.createdAt);
  const questions = await db.select().from(quizQuestionsTable).orderBy(quizQuestionsTable.sortOrder);
  res.json(quizzes.map((quiz) => ({ ...quiz, questions: questions.filter((q) => q.quizId === quiz.id) })));
});

router.post("/admin/quizzes", async (req, res) => {
  const parsed = insertQuizSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid quiz data", details: parsed.error.issues }); return; }
  const [quiz] = await db.insert(quizzesTable).values({ ...parsed.data, passThreshold: req.body.passThreshold ?? 70 }).returning();
  res.status(201).json({ ...quiz, questions: [], questionCount: 0 });
});

router.delete("/admin/quizzes/:quizId", async (req, res) => {
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, req.params.quizId));
  await db.delete(quizzesTable).where(eq(quizzesTable.id, req.params.quizId));
  res.json({ success: true });
});

router.post("/admin/quizzes/:quizId/questions", async (req, res) => {
  const { quizId } = req.params;
  const quiz = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
  if (!quiz.length) { res.status(404).json({ error: "Quiz not found" }); return; }
  const parsed = insertQuizQuestionSchema.safeParse({ ...req.body, quizId });
  if (!parsed.success) { res.status(400).json({ error: "Invalid question data", details: parsed.error.issues }); return; }
  const [question] = await db.insert(quizQuestionsTable).values(parsed.data).returning();
  res.status(201).json(question);
});

router.delete("/admin/questions/:questionId", async (req, res) => {
  await db.delete(quizQuestionsTable).where(eq(quizQuestionsTable.id, req.params.questionId));
  res.json({ success: true });
});

// ── Q&A inbox ─────────────────────────────────────────────────────────────────
router.get("/admin/questions", async (_req, res) => {
  const questions = await db.select().from(questionsTable).orderBy(questionsTable.createdAt);
  res.json(questions);
});

router.patch("/admin/questions/:id/read", async (req, res) => {
  await db.update(questionsTable).set({ isRead: true }).where(eq(questionsTable.id, req.params.id));
  res.json({ success: true });
});

router.delete("/admin/questions/:id", async (req, res) => {
  await db.delete(questionsTable).where(eq(questionsTable.id, req.params.id));
  res.json({ success: true });
});

// ── Announcements ─────────────────────────────────────────────────────────────
router.get("/announcement", async (_req, res) => {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "announcement"));
  res.json({ message: row?.value ?? "" });
});

router.post("/admin/announcement", async (req, res) => {
  const { message } = req.body as { message?: string };
  if (message && message.trim()) {
    await db.insert(settingsTable)
      .values({ key: "announcement", value: message.trim() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: message.trim(), updatedAt: new Date() } });
    res.json({ success: true, message: message.trim() });
  } else {
    await db.delete(settingsTable).where(eq(settingsTable.key, "announcement"));
    res.json({ success: true, message: "" });
  }
});

export default router;
