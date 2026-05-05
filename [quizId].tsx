import { useState, useMemo, useRef } from "react";
import { useParams, Link } from "wouter";
import { useListSubjectQuizzes, useSubmitQuizAttempt, useGetSubject } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award, Printer, User } from "lucide-react";
import type { QuizResult } from "@workspace/api-client-react";
import { useProgress } from "@/hooks/useProgress";

function printCertificate(studentName: string, quizTitle: string, subjectName: string, percentage: number) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Certificate – ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@400;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Playfair Display', serif; }
    .cert { width: 800px; padding: 60px 80px; border: 16px solid #064E3B; position: relative; text-align: center; }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 2px solid #D97706; pointer-events: none; }
    .bismillah { font-family: 'Amiri', serif; font-size: 28px; color: #064E3B; margin-bottom: 24px; }
    h1 { font-size: 44px; color: #064E3B; margin-bottom: 8px; }
    .subtitle { font-size: 16px; color: #888; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
    .presented { font-size: 15px; color: #555; margin-bottom: 8px; }
    .name { font-size: 38px; color: #D97706; border-bottom: 2px solid #D97706; display: inline-block; padding: 0 40px 8px; margin-bottom: 30px; }
    .desc { font-size: 16px; color: #444; line-height: 1.8; max-width: 560px; margin: 0 auto 30px; }
    .score { display: inline-block; background: #064E3B; color: #fff; font-size: 28px; font-weight: 700; padding: 10px 32px; border-radius: 8px; margin-bottom: 36px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; }
    .footer-item { font-size: 12px; color: #888; }
    .footer-item strong { display: block; color: #064E3B; font-size: 14px; margin-bottom: 4px; }
    .seal { width: 72px; height: 72px; border-radius: 50%; border: 3px solid #D97706; display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 0 auto; }
    .seal-text { font-size: 10px; color: #D97706; font-weight: 700; letter-spacing: 1px; }
    @media print { body { min-height: auto; } .cert { border-width: 12px; } }
  </style>
</head>
<body>
<div class="cert">
  <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
  <h1>Al-Mishkat</h1>
  <div class="subtitle">Certificate of Achievement</div>
  <div class="presented">This certificate is proudly presented to</div>
  <div><span class="name">${studentName || "A Student of Knowledge"}</span></div>
  <div class="desc">
    for successfully completing the examination on<br />
    <strong>${quizTitle}</strong><br />
    in the subject of <strong>${subjectName}</strong>
  </div>
  <div class="score">${percentage}% Score</div>
  <div class="footer">
    <div class="footer-item"><strong>Date</strong>${date}</div>
    <div class="seal"><div class="seal-text">AL-<br/>MISHKAT</div></div>
    <div class="footer-item"><strong>Platform</strong>Al-Mishkat Academy</div>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`);
  win.document.close();
}

export default function Quiz() {
  const { subjectId, quizId } = useParams<{ subjectId: string; quizId: string }>();

  const [studentName, setStudentName] = useState("");
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data: subject } = useGetSubject(subjectId, {
    query: { enabled: !!subjectId, queryKey: ["/api/subjects", subjectId] },
  });

  const { data: quizzes, isLoading, isError, refetch } = useListSubjectQuizzes(subjectId, {
    query: { enabled: !!subjectId, queryKey: ["/api/subjects", subjectId, "quizzes"] },
  });

  const submitQuiz = useSubmitQuizAttempt();
  const { recordQuizAttempt } = useProgress();
  const quiz = useMemo(() => quizzes?.find((q) => q.id === quizId), [quizzes, quizId]);

  if (isLoading) return <Layout><LoadingState message="Loading exam..." /></Layout>;
  if (isError || !quiz) return <Layout><ErrorState message="Failed to load quiz." onRetry={() => refetch()} /></Layout>;

  // ── Step 0: Enter name ────────────────────────────────────────────────────
  if (!nameSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <div className="mb-6">
            <Link href={`/subjects/${subjectId}`}>
              <Button variant="ghost" className="text-muted-foreground -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </Link>
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-8 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold mb-2">{quiz.title}</h1>
                <p className="text-muted-foreground">{subject?.name} · {quiz.difficulty} · {quiz.questions.length} questions</p>
              </div>
              <div className="w-full space-y-3">
                <label className="text-sm font-medium text-left block">
                  Your name <span className="text-muted-foreground">(for your certificate)</span>
                </label>
                <Input
                  placeholder="e.g. Abdullah Ahmed"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") setNameSubmitted(true); }}
                  className="text-center text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">You can leave this blank — your name appears on the certificate if you pass.</p>
              </div>
              <Button size="lg" className="w-full" onClick={() => setNameSubmitted(true)}>
                Start Exam <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = (currentQuestionIndex / quiz.questions.length) * 100;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  const handleSelectOption = (optionIndex: number) => {
    if (!result) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));
      submitQuiz.mutate(
        { quizId: quizId!, data: { answers: formattedAnswers } },
        {
          onSuccess: res => {
            setResult(res);
            recordQuizAttempt({
              quizId: quizId!,
              subjectId: subjectId!,
              passed: res.passed,
              percentage: res.percentage,
            });
          },
        }
      );
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // ── Results View ──────────────────────────────────────────────────────────
  if (result) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="mb-8">
            <Link href={`/subjects/${subjectId}`}>
              <Button variant="ghost" className="mb-4 text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subject
              </Button>
            </Link>
            <Card
              className={`border-2 ${
                result.passed
                  ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                  : "border-red-500 bg-red-50/50 dark:bg-red-950/20"
              }`}
            >
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                    result.passed
                      ? "bg-green-100 text-green-600 dark:bg-green-900/50"
                      : "bg-red-100 text-red-600 dark:bg-red-900/50"
                  }`}
                >
                  <Award className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {result.passed ? "Alhamdulillah, You Passed!" : "Requires More Review"}
                </h2>
                <div className="text-5xl font-serif font-bold my-6">{result.percentage}%</div>
                <p className="text-muted-foreground text-lg">
                  You scored {result.score} out of {result.totalQuestions} correctly.
                </p>
                {result.passed && (
                  <Button
                    size="lg"
                    className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                    onClick={() =>
                      printCertificate(
                        studentName,
                        quiz.title,
                        subject?.name ?? "Islamic Studies",
                        result.percentage
                      )
                    }
                  >
                    <Printer className="w-5 h-5" /> Download Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-serif font-bold mb-6">Detailed Review</h3>
          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const feedback = result.feedback.find(
                (f: { questionId: string; correct: boolean; explanation: string }) =>
                  f.questionId === q.id
              );
              const userAnswer = answers[q.id];
              const isCorrect = feedback?.correct;

              return (
                <Card
                  key={q.id}
                  className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-muted-foreground mb-1">
                          Question {idx + 1}
                        </div>
                        <h4 className="text-lg font-bold mb-4">{q.question}</h4>
                        <div className="space-y-2 mb-4">
                          {q.options.map((opt, optIdx) => {
                            const isUserSelection = userAnswer === optIdx;
                            const isActualCorrect = q.correctIndex === optIdx;
                            let cls =
                              "p-3 rounded-md border text-sm ";
                            if (isActualCorrect)
                              cls +=
                                "bg-green-100 border-green-500 text-green-900 dark:bg-green-900/40 dark:text-green-100";
                            else if (isUserSelection && !isActualCorrect)
                              cls +=
                                "bg-red-100 border-red-500 text-red-900 dark:bg-red-900/40 dark:text-red-100";
                            else cls += "bg-muted border-border";
                            return (
                              <div key={optIdx} className={cls}>
                                {opt}{" "}
                                {isUserSelection && !isActualCorrect && "(Your answer)"}
                                {isActualCorrect && "(Correct answer)"}
                              </div>
                            );
                          })}
                        </div>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-sm">
                          <span className="font-bold block mb-1">Explanation:</span>
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            {result.passed && (
              <Button
                variant="outline"
                onClick={() =>
                  printCertificate(
                    studentName,
                    quiz.title,
                    subject?.name ?? "Islamic Studies",
                    result.percentage
                  )
                }
                className="gap-2"
              >
                <Printer className="w-4 h-4" /> Print Certificate
              </Button>
            )}
            <Link href={`/subjects/${subjectId}`}>
              <Button size="lg">Return to Subject</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Active Quiz View ──────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href={`/subjects/${subjectId}`}>
            <Button variant="ghost" className="text-muted-foreground -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Exit Exam
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">
            {subject?.name} · {quiz.difficulty}
            {studentName && <span> · {studentName}</span>}
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <div className="bg-card px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="font-medium">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="text-muted-foreground text-sm">{Math.round(progress)}% completed</span>
          </div>
          <Progress value={progress} className="h-1 rounded-none bg-muted [&>div]:bg-primary" />
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-8 leading-relaxed">{currentQuestion.question}</h2>
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                      ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    data-testid={`quiz-option-${idx}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isSelected ? "border-primary" : "border-muted-foreground group-hover:border-primary/50"}`}
                    >
                      {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                    <span className="text-lg">{option}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0 || submitQuiz.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isAnswered || submitQuiz.isPending}
            className="min-w-[140px]"
            data-testid="button-next-question"
          >
            {submitQuiz.isPending
              ? "Submitting..."
              : isLastQuestion
              ? "Submit Exam"
              : (<>Next <ArrowRight className="w-4 h-4 ml-2" /></>)}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
