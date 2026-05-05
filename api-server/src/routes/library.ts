import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { videosTable, pdfsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/library", async (_req, res) => {
  const [videos, pdfs] = await Promise.all([
    db.select().from(videosTable).orderBy(desc(videosTable.createdAt)),
    db.select().from(pdfsTable).orderBy(desc(pdfsTable.createdAt)),
  ]);

  const videoItems = videos.map(v => ({
    id: v.id,
    kind: "video" as const,
    title: v.title,
    description: v.description ?? "",
    subjectId: v.subjectId,
    type: v.type,
    duration: v.duration,
    viewCount: v.viewCount ?? 0,
    tags: (v.tags as string[]) ?? [],
    thumbnailUrl: v.thumbnailUrl ?? null,
    videoUrl: `/api/storage/objects/${v.objectPath.replace(/^\/objects\//, "")}`,
    createdAt: v.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  const pdfItems = pdfs.map(p => ({
    id: p.id,
    kind: "pdf" as const,
    title: p.title,
    description: p.description ?? "",
    subjectId: p.subjectId,
    type: "pdf" as const,
    category: p.category,
    pageCount: p.pageCount ?? 0,
    fileSize: p.fileSize ?? "",
    tags: (p.tags as string[]) ?? [],
    thumbnailUrl: null,
    downloadUrl: `/api/storage/objects/${p.objectPath.replace(/^\/objects\//, "")}`,
    createdAt: p.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  res.json([...videoItems, ...pdfItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ));
});

export default router;
