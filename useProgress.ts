import { useState, useCallback } from "react";

export type QuizRecord = {
  quizId: string;
  subjectId: string;
  passed: boolean;
  percentage: number;
  attemptedAt: number;
};

export type SubjectProgress = {
  visited: boolean;
  quizAttempted: boolean;
  quizPassed: boolean;
  bestScore: number;
  attempts: number;
};

const STORAGE_KEY = "al-mishkat-progress";

function load(): QuizRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(records: QuizRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useProgress() {
  const [records, setRecords] = useState<QuizRecord[]>(load);

  const recordQuizAttempt = useCallback((record: Omit<QuizRecord, "attemptedAt">) => {
    setRecords(prev => {
      const next = [{ ...record, attemptedAt: Date.now() }, ...prev];
      save(next);
      return next;
    });
  }, []);

  const getSubjectProgress = useCallback(
    (subjectId: string, visitedSubjectIds: string[]): SubjectProgress => {
      const subjectRecords = records.filter(r => r.subjectId === subjectId);
      const passed = subjectRecords.some(r => r.passed);
      const bestScore = subjectRecords.length > 0 ? Math.max(...subjectRecords.map(r => r.percentage)) : 0;
      return {
        visited: visitedSubjectIds.includes(subjectId),
        quizAttempted: subjectRecords.length > 0,
        quizPassed: passed,
        bestScore,
        attempts: subjectRecords.length,
      };
    },
    [records]
  );

  const totalPassed = records.filter(r => r.passed).length;
  const uniqueSubjectsPassed = new Set(records.filter(r => r.passed).map(r => r.subjectId)).size;
  const totalAttempts = records.length;

  const clearProgress = useCallback(() => {
    save([]);
    setRecords([]);
  }, []);

  return { records, recordQuizAttempt, getSubjectProgress, totalPassed, uniqueSubjectsPassed, totalAttempts, clearProgress };
}
