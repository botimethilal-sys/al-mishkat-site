import { Router, type IRouter } from "express";
import {
  GetSubjectParams,
  ListSubjectPdfsParams,
  ListSubjectImagesParams,
  ListSubjectQuizzesParams,
  ListSubjectVideosParams,
  ListSubjectVideosQueryParams,
  SubmitSubjectQuestionParams,
  SubmitSubjectQuestionBody,
} from "@workspace/api-zod";
import { SUBJECTS, IMAGES } from "../data/seed";
import { db } from "@workspace/db";
import { videosTable, pdfsTable, quizzesTable, quizQuestionsTable, questionsTable } from "@workspace/db/schema";
import { eq, and, count, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/subjects", async (_req, res) => {
  const [videoCounts, pdfCounts, quizCounts] = await Promise.all([
    db.select({ subjectId: videosTable.subjectId, total: count() })
      .from(videosTable)
      .groupBy(videosTable.subjectId),
    db.select({ subjectId: pdfsTable.subjectId, total: count() })
      .from(pdfsTable)
      .groupBy(pdfsTable.subjectId),
    db.select({ subjectId: quizzesTable.subjectId, total: count() })
      .from(quizzesTable)
      .groupBy(quizzesTable.subjectId),
  ]);

  const vcMap: Record<string, number> = {};
  const pcMap: Record<string, number> = {};
  const qcMap: Record<string, number> = {};
  for (const r of videoCounts) vcMap[r.subjectId] = r.total;
  for (const r of pdfCounts) pcMap[r.subjectId] = r.total;
  for (const r of quizCounts) qcMap[r.subjectId] = r.total;

  const subjects = SUBJECTS.map((s) => ({
    ...s,
    videoCount: vcMap[s.id] ?? 0,
    pdfCount: pcMap[s.id] ?? 0,
    imageCount: IMAGES.filter((img) => img.subjectId === s.id).length,
    quizCount: qcMap[s.id] ?? 0,
  }));

  res.json(subjects);
});

router.get("/subjects/:subjectId", async (req, res) => {
  const { subjectId } = GetSubjectParams.parse(req.params);
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) { res.status(404).json({ error: "Subject not found" }); return; }

  const [videoCountResult, pdfCountResult, quizCountResult] = await Promise.all([
    db.select({ total: count() }).from(videosTable).where(eq(videosTable.subjectId, subjectId)),
    db.select({ total: count() }).from(pdfsTable).where(eq(pdfsTable.subjectId, subjectId)),
    db.select({ total: count() }).from(quizzesTable).where(eq(quizzesTable.subjectId, subjectId)),
  ]);

  res.json({
    ...subject,
    videoCount: videoCountResult[0]?.total ?? 0,
    pdfCount: pdfCountResult[0]?.total ?? 0,
    imageCount: IMAGES.filter((img) => img.subjectId === subjectId).length,
    quizCount: quizCountResult[0]?.total ?? 0,
  });
});

router.get("/subjects/:subjectId/videos", async (req, res) => {
  const { subjectId } = ListSubjectVideosParams.parse(req.params);
  const query = ListSubjectVideosQueryParams.parse(req.query);
  const conditions = [eq(videosTable.subjectId, subjectId)];
  if (query.type) conditions.push(eq(videosTable.type, query.type as "lecture" | "short" | "reel"));
  const videos = await db.select().from(videosTable).where(and(...conditions)).orderBy(videosTable.createdAt);
  res.json(videos.map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    subjectId: v.subjectId,
    type: v.type,
    videoUrl: `/api/storage/objects/${v.objectPath.replace(/^\/objects\//, '')}`,
    thumbnailUrl: v.thumbnailUrl ?? undefined,
    duration: v.duration,
    viewCount: v.viewCount ?? 0,
    tags: (v.tags as string[]) ?? [],
  })));
});

router.post("/subjects/:subjectId/videos/:videoId/view", async (req, res) => {
  const { videoId } = req.params;
  await db.update(videosTable)
    .set({ viewCount: sql`${videosTable.viewCount} + 1` })
    .where(eq(videosTable.id, videoId));
  res.json({ success: true });
});

router.get("/subjects/:subjectId/pdfs", async (req, res) => {
  const { subjectId } = ListSubjectPdfsParams.parse(req.params);
  const pdfs = await db.select().from(pdfsTable).where(eq(pdfsTable.subjectId, subjectId)).orderBy(pdfsTable.createdAt);
  res.json(pdfs.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    subjectId: p.subjectId,
    category: p.category,
    pageCount: p.pageCount,
    fileSize: p.fileSize,
    downloadUrl: `/api/storage/objects/${p.objectPath.replace(/^\/objects\//, '')}`,
    tags: (p.tags as string[]) ?? [],
  })));
});

router.get("/subjects/:subjectId/images", (req, res) => {
  const { subjectId } = ListSubjectImagesParams.parse(req.params);
  const images = IMAGES.filter((img) => img.subjectId === subjectId);
  res.json(images);
});

router.get("/subjects/:subjectId/quizzes", async (req, res) => {
  const { subjectId } = ListSubjectQuizzesParams.parse(req.params);
  const quizzes = await db.select().from(quizzesTable)
    .where(eq(quizzesTable.subjectId, subjectId))
    .orderBy(quizzesTable.createdAt);

  const questions = await db.select().from(quizQuestionsTable)
    .orderBy(quizQuestionsTable.sortOrder);

  const result = quizzes.map((quiz) => {
    const quizQuestions = questions
      .filter((q) => q.quizId === quiz.id)
      .map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      }));
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subjectId: quiz.subjectId,
      difficulty: quiz.difficulty,
      passThreshold: quiz.passThreshold,
      questionCount: quizQuestions.length,
      questions: quizQuestions,
    };
  });

  res.json(result);
});

router.post("/subjects/:subjectId/questions", async (req, res) => {
  const { subjectId } = SubmitSubjectQuestionParams.parse(req.params);
  const body = SubmitSubjectQuestionBody.parse(req.body);
  req.log.info({ subjectId, question: body.question }, "Question submitted for subject");

  const [saved] = await db.insert(questionsTable).values({
    contextId: subjectId,
    contextType: "subject",
    name: body.name,
    question: body.question,
  }).returning();

  res.status(201).json({
    id: saved.id,
    message: "Your question has been submitted. JazakAllahu Khayran!",
    submittedAt: saved.createdAt.toISOString(),
  });
});

export default router;
