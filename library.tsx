import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoadingState } from "@/components/shared/LoadingState";
import { PdfViewerModal } from "@/components/shared/PdfViewerModal";
import { Search, Video, FileText, X, PlayCircle, Eye, Library, SlidersHorizontal, Tag } from "lucide-react";

const SUBJECTS = [
  { id: "aqidah", name: "Aqidah" },
  { id: "tafsir", name: "Tafsir" },
  { id: "hadith", name: "Hadith" },
  { id: "fiqh", name: "Fiqh" },
  { id: "tarbiyah", name: "Tarbiyah" },
  { id: "sirah", name: "Sirah" },
  { id: "feed", name: "Feed" },
];

type LibraryItem = {
  id: string;
  kind: "video" | "pdf";
  title: string;
  description: string;
  subjectId: string;
  type: string;
  duration?: string;
  viewCount?: number;
  category?: string;
  pageCount?: number;
  fileSize?: string;
  tags: string[];
  thumbnailUrl: string | null;
  videoUrl?: string;
  downloadUrl?: string;
  createdAt: string;
};

function VideoModal({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{item.title}</DialogTitle>
        <div className="relative">
          <video src={item.videoUrl} controls autoPlay className="w-full aspect-video bg-black" style={{ maxHeight: "70vh" }} />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-zinc-900 text-white p-5">
          <h2 className="font-bold text-lg">{item.title}</h2>
          {item.description && <p className="text-white/60 text-sm mt-1">{item.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LibraryPage() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const initialTag = urlParams.get("tag") ?? "";

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "video" | "pdf">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most-viewed">("newest");
  const [activeTag, setActiveTag] = useState(initialTag);
  const [playingVideo, setPlayingVideo] = useState<LibraryItem | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

  const { data: items, isLoading } = useQuery<LibraryItem[]>({
    queryKey: ["/api/library"],
    queryFn: () => fetch("/api/library").then(r => r.json()),
  });

  const allTags = useMemo(() => {
    if (!items) return [];
    const set = new Set<string>();
    items.forEach(i => i.tags?.forEach(t => set.add(t)));
    return [...set].sort();
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    let result = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (kindFilter !== "all") result = result.filter(i => i.kind === kindFilter);
    if (subjectFilter !== "all") result = result.filter(i => i.subjectId === subjectFilter);
    if (activeTag) result = result.filter(i => i.tags?.includes(activeTag));
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "oldest") result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sortBy === "most-viewed") result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    return result;
  }, [items, search, kindFilter, subjectFilter, activeTag, sortBy]);

  const subjectName = (id: string) => SUBJECTS.find(s => s.id === id)?.name ?? id;

  function clearFilters() {
    setSearch(""); setKindFilter("all"); setSubjectFilter("all"); setSortBy("newest"); setActiveTag("");
  }
  const hasFilters = search || kindFilter !== "all" || subjectFilter !== "all" || sortBy !== "newest" || activeTag;

  return (
    <Layout>
      {playingVideo && <VideoModal item={playingVideo} onClose={() => setPlayingVideo(null)} />}
      {viewingPdf && <PdfViewerModal url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}

      {/* Header */}
      <div className="bg-primary text-primary-foreground py-14 border-b border-primary-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20">
              <Library className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Content Library</h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5">Every video and document on Al-Mishkat in one place</p>
            </div>
          </div>
          {items && (
            <div className="flex gap-4 text-sm text-primary-foreground/70">
              <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> {items.filter(i => i.kind === "video").length} videos</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {items.filter(i => i.kind === "pdf").length} PDFs</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search titles and descriptions..."
                className="pl-9 bg-card"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={kindFilter} onValueChange={v => setKindFilter(v as any)}>
                <SelectTrigger className="w-[120px] bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="pdf">PDFs</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px] bg-card"><SelectValue placeholder="All subjects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                <SelectTrigger className="w-[145px] bg-card"><SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="most-viewed">Most viewed</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tag cloud */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1 mr-1"><Tag className="w-3 h-3" /> Tags:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${activeTag === tag ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-5">
          {isLoading ? "Loading..." : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}${activeTag ? ` tagged "${activeTag}"` : ""}`}
        </p>

        {isLoading ? (
          <LoadingState message="Loading library..." />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Library className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No items match your filters.</p>
            {hasFilters && <Button variant="link" onClick={clearFilters}>Clear filters</Button>}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div
                key={`${item.kind}-${item.id}`}
                className="flex gap-4 p-4 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors"
              >
                {/* Thumbnail / icon */}
                <div className="w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : item.kind === "video" ? (
                    <Video className="w-6 h-6 text-primary/40" />
                  ) : (
                    <FileText className="w-6 h-6 text-primary/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-base truncate">{item.title}</h3>
                    <Badge variant="outline" className="capitalize text-xs shrink-0">{item.kind === "video" ? item.type : item.category ?? "pdf"}</Badge>
                    <Badge variant="secondary" className="text-xs shrink-0">{subjectName(item.subjectId)}</Badge>
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{item.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.duration && <span>{item.duration}</span>}
                    {item.pageCount ? <span>{item.pageCount} pages</span> : null}
                    {item.viewCount !== undefined && item.viewCount > 0 && (
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.viewCount.toLocaleString()} views</span>
                    )}
                    {item.tags?.length > 0 && (
                      <span className="flex items-center gap-1 flex-wrap">
                        {item.tags.map(tag => (
                          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
                            className={`px-2 py-0.5 rounded-full border text-[11px] transition-colors ${activeTag === tag ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:border-primary/50"}`}>
                            {tag}
                          </button>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center shrink-0">
                  {item.kind === "video" && item.videoUrl ? (
                    <Button size="sm" onClick={() => setPlayingVideo(item)}>
                      <PlayCircle className="w-4 h-4 mr-1.5" /> Watch
                    </Button>
                  ) : item.kind === "pdf" && item.downloadUrl ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewingPdf({ url: item.downloadUrl!, title: item.title })}>
                        <Eye className="w-4 h-4 mr-1.5" /> Read
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
