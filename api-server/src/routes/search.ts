import { Router, type IRouter } from "express";
import { SearchContentQueryParams } from "@workspace/api-zod";
import { SUBJECTS, IMAGES, PILLARS } from "../data/seed";
import { db } from "@workspace/db";
import { videosTable, pdfsTable } from "@workspace/db/schema";
import { or, ilike } from "drizzle-orm";

const router: IRouter = Router();

router.get("/search", async (req, res) => {
  const { q, type } = SearchContentQueryParams.parse(req.query);
  const query = q.toLowerCase();

  const [dbVideos, dbPdfs] = await Promise.all([
    (!type || type === "video")
      ? db.select().from(videosTable).where(
          or(ilike(videosTable.title, `%${q}%`), ilike(videosTable.description, `%${q}%`))
        )
      : Promise.resolve([]),
    (!type || type === "pdf")
      ? db.select().from(pdfsTable).where(
          or(ilike(pdfsTable.title, `%${q}%`), ilike(pdfsTable.description, `%${q}%`))
        )
      : Promise.resolve([]),
  ]);

  const matchVideos = dbVideos.map(v => ({
    id: v.id,
    title: v.title,
    description: v.description,
    subjectId: v.subjectId,
    type: v.type,
    videoUrl: `/api/storage/objects/${v.objectPath.replace(/^\/objects\//, '')}`,
    thumbnailUrl: v.thumbnailUrl ?? undefined,
    duration: v.duration,
  }));

  const matchPdfs = dbPdfs.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    subjectId: p.subjectId,
    category: p.category,
    pageCount: p.pageCount,
    fileSize: p.fileSize,
    downloadUrl: `/api/storage/objects${p.objectPath.startsWith('/') ? p.objectPath : '/' + p.objectPath}`,
  }));

  const matchImages = !type || type === "image"
    ? IMAGES.filter(img => img.title.toLowerCase().includes(query) || img.bookTitle.toLowerCase().includes(query))
    : [];

  const matchSubjects = !type || type === "subject"
    ? SUBJECTS.filter(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
    : [];

  const matchPillars = !type || type === "pillar"
    ? PILLARS.filter(p => p.name.toLowerCase().includes(query) || p.shortDescription.toLowerCase().includes(query))
    : [];

  const totalResults = matchVideos.length + matchPdfs.length + matchImages.length + matchSubjects.length + matchPillars.length;

  res.json({
    query: q,
    totalResults,
    videos: matchVideos,
    pdfs: matchPdfs,
    images: matchImages,
    subjects: matchSubjects,
    pillars: matchPillars,
  });
});

export default router;
