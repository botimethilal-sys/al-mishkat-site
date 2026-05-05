import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { videosTable, pdfsTable } from "@workspace/db/schema";
import { desc, count } from "drizzle-orm";
import { SUBJECTS, QUIZZES, IMAGES, PILLARS } from "../data/seed";

const router: IRouter = Router();

router.get("/feed", async (_req, res) => {
  const [recentVideos, recentPdfs] = await Promise.all([
    db.select().from(videosTable).orderBy(desc(videosTable.createdAt)).limit(6),
    db.select().from(pdfsTable).orderBy(desc(pdfsTable.createdAt)).limit(4),
  ]);

  const videoFeed = recentVideos.map((v) => {
    const isFeed = v.subjectId === "feed";
    const subject = SUBJECTS.find((s) => s.id === v.subjectId);
    return {
      id: v.id.toString(),
      type: "video" as const,
      subtype: v.type,
      title: v.title,
      description: v.description ?? "",
      thumbnailUrl: v.thumbnailUrl ?? undefined,
      videoUrl: `/api/storage/objects/${v.objectPath.replace(/^\/objects\//, "")}`,
      subjectId: v.subjectId,
      subjectName: isFeed ? "Feed" : (subject?.name ?? ""),
      viewCount: v.viewCount ?? 0,
      createdAt: v.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  });

  const pdfFeed = recentPdfs.map((p) => {
    const subject = SUBJECTS.find((s) => s.id === p.subjectId);
    return {
      id: p.id.toString(),
      type: "pdf" as const,
      subtype: p.category ?? "book",
      title: p.title,
      description: p.description ?? "",
      thumbnailUrl: undefined as string | undefined,
      subjectId: p.subjectId,
      subjectName: subject?.name ?? "",
      createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  });

  const feed = [...videoFeed, ...pdfFeed].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  res.json(feed);
});

router.get("/stats", async (_req, res) => {
  const [videoCountResult, pdfCountResult] = await Promise.all([
    db.select({ value: count() }).from(videosTable),
    db.select({ value: count() }).from(pdfsTable),
  ]);

  res.json({
    totalVideos: videoCountResult[0]?.value ?? 0,
    totalPdfs: pdfCountResult[0]?.value ?? 0,
    totalImages: IMAGES.length,
    totalQuizzes: QUIZZES.length,
    totalSubjects: SUBJECTS.length,
    totalPillars: PILLARS.length,
  });
});

export default router;
