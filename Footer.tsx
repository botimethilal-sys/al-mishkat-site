import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 mt-auto">
      <div className="container mx-auto px-4 text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 opacity-80">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-serif font-bold text-lg text-primary">Al-Mishkat</span>
        </div>
        <p className="text-foreground/60 max-w-md mx-auto mb-6">
          A dignified, scholarly Islamic learning platform for serious students of knowledge.
        </p>
        <p className="text-sm text-foreground/40">
          &copy; {new Date().getFullYear()} Al-Mishkat Educational Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
