import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import pillarsRouter from "./pillars";
import quizzesRouter from "./quizzes";
import searchRouter from "./search";
import feedRouter from "./feed";
import storageRouter from "./storage";
import adminRouter from "./admin";
import libraryRouter from "./library";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(adminRouter); // adminRouter also exposes GET /api/announcement (public)
router.use(subjectsRouter);
router.use(pillarsRouter);
router.use(quizzesRouter);
router.use(searchRouter);
router.use(feedRouter);
router.use(libraryRouter);

export default router;
