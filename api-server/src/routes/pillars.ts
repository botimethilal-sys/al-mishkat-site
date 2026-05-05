import { Router, type IRouter } from "express";
import {
  GetPillarParams,
  SubmitPillarQuestionParams,
  SubmitPillarQuestionBody,
} from "@workspace/api-zod";
import { PILLARS, PILLAR_DETAILS } from "../data/seed";
import { db } from "@workspace/db";
import { questionsTable, pillarContentTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/pillars", (_req, res) => {
  res.json(PILLARS);
});

router.get("/pillars/:pillarId", async (req, res) => {
  const { pillarId } = GetPillarParams.parse(req.params);
  const detail = PILLAR_DETAILS.find((p) => p.id === pillarId);
  if (!detail) { res.status(404).json({ error: "Pillar not found" }); return; }

  const content = await db.select().from(pillarContentTable)
    .where(eq(pillarContentTable.pillarId, pillarId))
    .orderBy(pillarContentTable.createdAt);

  const videos = content
    .filter((c) => c.type === "video_link")
    .map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      type: "reel" as const,
      duration: "",
      thumbnailUrl: c.thumbnailUrl ?? "",
      videoUrl: c.url,
      subjectId: "",
      uploadedAt: c.createdAt.toISOString(),
    }));

  const links = content
    .filter((c) => c.type === "pdf")
    .map((c) => ({
      title: c.title,
      url: `/api/storage/objects/${c.url.replace(/^\/objects\//, '')}`,
      description: c.description,
    }));

  res.json({ ...detail, videos, links });
});

router.post("/pillars/:pillarId/questions", async (req, res) => {
  const { pillarId } = SubmitPillarQuestionParams.parse(req.params);
  const body = SubmitPillarQuestionBody.parse(req.body);
  req.log.info({ pillarId, question: body.question }, "Question submitted for pillar");

  const [saved] = await db.insert(questionsTable).values({
    contextId: pillarId,
    contextType: "pillar",
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
