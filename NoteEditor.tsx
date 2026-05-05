import { useState, useRef, useEffect } from "react";
import { StickyNote, Check, X } from "lucide-react";
import { useNote } from "@/hooks/useNotes";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  itemId: string;
  itemTitle: string;
  size?: "sm" | "md";
  className?: string;
}

export function NoteEditor({ itemId, itemTitle, size = "md", className }: NoteEditorProps) {
  const { text, saveNote, hasNote } = useNote(itemId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(text);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [open]);

  function handleSave() {
    saveNote(draft);
    setOpen(false);
  }

  function handleCancel() {
    setDraft(text);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        aria-label={hasNote ? "Edit note" : "Add note"}
        title={hasNote ? "Edit your note" : "Add a personal note"}
        className={cn(
          "rounded-full flex items-center justify-center border transition-all duration-200 shrink-0",
          size === "sm" ? "w-7 h-7" : "w-9 h-9",
          hasNote
            ? "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400"
            : "bg-card/80 border-border text-muted-foreground hover:text-yellow-500 hover:border-yellow-400/60"
        )}
      >
        <StickyNote className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", hasNote && "fill-current opacity-70")} />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-2 right-0 w-72 bg-card border border-border rounded-xl shadow-xl p-3"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-xs font-semibold text-muted-foreground mb-2 truncate">
            Note: <span className="text-foreground">{itemTitle}</span>
          </p>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Write your note here..."
            rows={4}
            className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Check className="w-3 h-3" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-muted text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted/70 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
          {hasNote && (
            <button
              onClick={() => { saveNote(""); setOpen(false); }}
              className="w-full mt-1.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              Delete note
            </button>
          )}
        </div>
      )}
    </div>
  );
}
