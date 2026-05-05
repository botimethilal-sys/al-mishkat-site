import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { useBookmarks, type BookmarkItem } from "@/hooks/useBookmarks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark, Video, FileText, Link as LinkIcon,
  Trash2, PlayCircle, Download, ExternalLink, BookOpen
} from "lucide-react";

const TYPE_ICONS = {
  video: Video,
  pdf: FileText,
  link: LinkIcon,
};

const TYPE_LABELS = {
  video: "Video",
  pdf: "PDF",
  link: "Resource",
};

function BookmarkCard({ item, onRemove }: { item: BookmarkItem; onRemove: () => void }) {
  const Icon = TYPE_ICONS[item.type];
  const isVideo = item.type === "video";
  const isPdf = item.type === "pdf";

  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group">
      {/* Thumbnail or icon */}
      {item.thumbnailUrl ? (
        <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-muted relative">
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-24 h-16 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-bold text-base leading-snug line-clamp-2 flex-1">{item.title}</h3>
        </div>
        {item.description && (
          <p className="text-muted-foreground text-sm line-clamp-1 mb-2">{item.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize text-xs">{TYPE_LABELS[item.type]}</Badge>
          <Link
            href={`/${item.contextType === "subject" ? "subjects" : "pillars"}/${item.contextId}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {item.contextName}
          </Link>
          <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
            {new Date(item.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        {isVideo && (
          <a
            href={item.url}
            target={item.url.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button size="sm" variant="outline" className="text-xs px-3 h-7 border-primary/30 text-primary hover:bg-primary/5 w-full">
              <PlayCircle className="w-3 h-3 mr-1" /> Watch
            </Button>
          </a>
        )}
        {isPdf && (
          <a href={item.url} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs px-3 h-7 border-primary/30 text-primary hover:bg-primary/5 w-full">
              <Download className="w-3 h-3 mr-1" /> Open
            </Button>
          </a>
        )}
        {item.type === "link" && (
          <a href={item.url} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs px-3 h-7 border-primary/30 text-primary hover:bg-primary/5 w-full">
              <ExternalLink className="w-3 h-3 mr-1" /> Open
            </Button>
          </a>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-xs px-3 h-7 text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
          onClick={onRemove}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
}

export default function Saved() {
  const { bookmarks, remove, clearAll } = useBookmarks();
  const [filter, setFilter] = useState<"all" | "video" | "pdf" | "link">("all");

  const filtered = filter === "all" ? bookmarks : bookmarks.filter((b) => b.type === filter);

  const counts = {
    all: bookmarks.length,
    video: bookmarks.filter((b) => b.type === "video").length,
    pdf: bookmarks.filter((b) => b.type === "pdf").length,
    link: bookmarks.filter((b) => b.type === "link").length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2 flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-accent fill-accent" /> My Saved
            </h1>
            <p className="text-muted-foreground">
              {bookmarks.length === 0
                ? "Nothing saved yet."
                : `${bookmarks.length} item${bookmarks.length !== 1 ? "s" : ""} saved across all subjects and pillars.`}
            </p>
          </div>
          {bookmarks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { if (confirm("Remove all saved items?")) clearAll(); }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear all
            </Button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          /* Empty state */
          <Card className="border-border bg-card">
            <CardContent className="py-20 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Bookmark className="w-10 h-10 text-primary/40" />
              </div>
              <div>
                <p className="text-xl font-bold mb-2">No saved items yet</p>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Tap the bookmark icon on any video, PDF, or resource to save it here for quick access later.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Link href="/subjects">
                  <Button variant="default">Browse Subjects</Button>
                </Link>
                <Link href="/pillars">
                  <Button variant="outline">The 5 Pillars</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["all", "video", "pdf", "link"] as const).map((tab) => (
                counts[tab] > 0 || tab === "all" ? (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      filter === tab
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "all" && <Bookmark className="w-3.5 h-3.5" />}
                    {tab === "video" && <Video className="w-3.5 h-3.5" />}
                    {tab === "pdf" && <FileText className="w-3.5 h-3.5" />}
                    {tab === "link" && <LinkIcon className="w-3.5 h-3.5" />}
                    <span className="capitalize">{tab === "all" ? "All" : TYPE_LABELS[tab] + "s"}</span>
                    <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                      filter === tab ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>{counts[tab]}</span>
                  </button>
                ) : null
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No {filter}s saved yet.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <BookmarkCard key={item.id} item={item} onRemove={() => remove(item.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
