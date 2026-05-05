import { Link } from "wouter";
import { useProgress } from "@/hooks/useProgress";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { CheckCircle2, Circle, BookOpen, BrainCircuit, TrendingUp, Trash2 } from "lucide-react";

const SUBJECTS = [
  { id: "aqidah",   name: "Aqidah",   arabic: "العقيدة",  color: "#064E3B" },
  { id: "tafsir",   name: "Tafsir",   arabic: "التفسير",  color: "#065F46" },
  { id: "hadith",   name: "Hadith",   arabic: "الحديث",   color: "#047857" },
  { id: "fiqh",     name: "Fiqh",     arabic: "الفقه",    color: "#059669" },
  { id: "tarbiyah", name: "Tarbiyah", arabic: "التربية",  color: "#0D9488" },
  { id: "sirah",    name: "Sirah",    arabic: "السيرة",   color: "#0891B2" },
];

function Ring({ value, size = 52 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={4} className="text-border" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={4}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        className="text-primary transition-all duration-700"
      />
    </svg>
  );
}

export function ProgressSection() {
  const { getSubjectProgress, totalPassed, uniqueSubjectsPassed, totalAttempts, clearProgress } = useProgress();
  const { recentlyViewed } = useRecentlyViewed();
  const visitedIds = recentlyViewed.map(s => s.id);

  const progresses = SUBJECTS.map(s => ({
    ...s,
    progress: getSubjectProgress(s.id, visitedIds),
  }));

  const visitedCount = progresses.filter(s => s.progress.visited).length;
  const hasAnyActivity = visitedCount > 0 || totalAttempts > 0;

  if (!hasAnyActivity) return null;

  return (
    <section className="py-14 container mx-auto px-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Your Progress</h2>
            <p className="text-sm text-muted-foreground">
              {visitedCount}/6 subjects explored
              {totalPassed > 0 && ` · ${uniqueSubjectsPassed} quiz${uniqueSubjectsPassed !== 1 ? "zes" : ""} passed`}
            </p>
          </div>
        </div>
        {totalAttempts > 0 && (
          <button
            onClick={() => { if (confirm("Clear all quiz progress records?")) clearProgress(); }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors mt-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Subject grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {progresses.map(({ id, name, arabic, color, progress }) => {
          const ringValue = progress.quizPassed ? 100 : progress.quizAttempted ? progress.bestScore : progress.visited ? 15 : 0;

          return (
            <Link key={id} href={`/subjects/${id}`}>
              <div className="group flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer text-center">
                {/* Ring with icon inside */}
                <div className="relative">
                  <Ring value={ringValue} size={56} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {progress.quizPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : progress.visited ? (
                      <BookOpen className="w-5 h-5 text-primary/60" />
                    ) : (
                      <Circle className="w-5 h-5 text-border" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <p className="font-bold text-sm group-hover:text-primary transition-colors leading-tight">{name}</p>
                  <p className="text-xs text-muted-foreground font-serif mt-0.5" dir="rtl">{arabic}</p>
                </div>

                {/* Status label */}
                <div className="mt-auto">
                  {progress.quizPassed ? (
                    <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Passed</span>
                  ) : progress.quizAttempted ? (
                    <span className="text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">{progress.bestScore}%</span>
                  ) : progress.visited ? (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">Visited</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground px-2 py-0.5">Not started</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Overall bar */}
      {totalAttempts > 0 && (
        <div className="mt-6 p-4 bg-card border border-border rounded-xl flex items-center gap-4">
          <BrainCircuit className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Quizzes passed</span>
              <span className="text-sm font-bold text-primary">{uniqueSubjectsPassed}/6 subjects</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${(uniqueSubjectsPassed / 6) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
