import { Bookmark } from "lucide-react";
import { useBookmarkItem, type BookmarkItem } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  item: BookmarkItem;
  size?: "sm" | "md";
  className?: string;
}

export function BookmarkButton({ item, size = "md", className }: BookmarkButtonProps) {
  const { saved, toggle } = useBookmarkItem(item.id);

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); toggle(item); }}
      aria-label={saved ? "Remove bookmark" : "Bookmark this"}
      title={saved ? "Remove from saved" : "Save for later"}
      className={cn(
        "rounded-full flex items-center justify-center transition-all duration-200 shrink-0",
        size === "sm" ? "w-7 h-7" : "w-9 h-9",
        saved
          ? "bg-accent text-accent-foreground shadow-sm scale-105"
          : "bg-card/80 text-muted-foreground border border-border hover:text-accent hover:border-accent/50",
        className
      )}
    >
      <Bookmark
        className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4", saved && "fill-current")}
      />
    </button>
  );
}
