import { Router, type IRouter } from "express";
import { SubmitQuizAttemptParams, SubmitQuizAttemptBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { quizzesTable, quizQuestionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/quizzes/:quizId/submit", async (req, res) => {
  const { quizId } = SubmitQuizAttemptParams.parse(req.params);
  const { answers } = SubmitQuizAttemptBody.parse(req.body);

  const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId));
  if (!quiz) { res.status(404).json({ error: "Quiz not found" }); return; }

  const questions = await db.select().from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId))
    .orderBy(quizQuestionsTable.sortOrder);

  let score = 0;
  const feedback = answers.map((answer) => {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) return { questionId: answer.questionId, correct: false, explanation: "Question not found." };
    const correct = answer.selectedIndex === question.correctIndex;
    if (correct) score++;
    return { questionId: answer.questionId, correct, explanation: question.explanation };
  });

  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passThreshold = quiz.passThreshold ?? 70;

  res.json({
    quizId,
    score,
    totalQuestions,
    percentage,
    passed: percentage >= passThreshold,
    passThreshold,
    feedback,
  });
});

export default router;
