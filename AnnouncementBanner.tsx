import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";

export function AnnouncementBanner() {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcement")
      .then(r => r.json())
      .then(data => { if (data.message) setMessage(data.message); })
      .catch(() => {});
  }, []);

  if (!message || dismissed) return null;

  return (
    <div className="w-full bg-accent text-accent-foreground px-4 py-3 flex items-center gap-3 shadow-sm z-40 relative">
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
        <Megaphone className="w-4 h-4 shrink-0" />
        <p className="text-sm font-medium text-center line-clamp-2">{message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 w-6 h-6 rounded-full hover:bg-accent-foreground/20 flex items-center justify-center transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
