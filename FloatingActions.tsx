import { useState, useEffect } from "react";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { Link } from "wouter";
import { useBookmarks } from "@/hooks/useBookmarks";
import { Bookmark } from "lucide-react";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const { bookmarks } = useBookmarks();
  const savedCount = bookmarks.length;

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2">
      {/* Saved shortcut */}
      {savedCount > 0 && (
        <Link href="/saved">
          <button
            className="group flex items-center gap-2 bg-accent text-accent-foreground px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-sm font-semibold"
            title="My Saved Items"
          >
            <Bookmark className="w-4 h-4 fill-current" />
            <span>{savedCount} saved</span>
          </button>
        </Link>
      )}

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
