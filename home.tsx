import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetPlatformStats, useGetLatestFeed, useListPillars } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProgressSection } from "@/components/shared/ProgressSection";
import { Book, Video, FileText, Image as ImageIcon, BrainCircuit, Library, ArrowRight, Search, BookOpen, Layers, Star, Clock, X, PlayCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const CW_PREFIX = "almishkat_cw_";

type CWEntry = { id: string; time: number; title: string; thumbnailUrl: string | null; videoUrl: string; duration: string; savedAt: number; };
type FeedVideo = { id: string; title: string; videoUrl?: string; thumbnailUrl?: string; subjectId: string; viewCount?: number; };

function ContinueWatchingSection({ onPlay }: { onPlay: (v: FeedVideo) => void }) {
  const [entries, setEntries] = useState<CWEntry[]>([]);

  useEffect(() => {
    const loaded: CWEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(CW_PREFIX)) continue;
      try {
        const val = JSON.parse(localStorage.getItem(key)!);
        loaded.push({ id: key.replace(CW_PREFIX, ""), ...val });
      } catch {}
    }
    loaded.sort((a, b) => b.savedAt - a.savedAt);
    setEntries(loaded.slice(0, 6));
  }, []);

  function dismiss(id: string) {
    localStorage.removeItem(CW_PREFIX + id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  if (entries.length === 0) return null;

  return (
    <section className="py-12 container mx-auto px-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Continue Watching</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(entry => (
          <div key={entry.id} className="relative group flex gap-3 p-3 border border-border rounded-xl bg-card hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => onPlay({ id: entry.id, title: entry.title, videoUrl: entry.videoUrl, thumbnailUrl: entry.thumbnailUrl ?? undefined, subjectId: "" })}>
            <div className="w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-primary/5 flex items-center justify-center relative">
              {entry.thumbnailUrl
                ? <img src={entry.thumbnailUrl} alt={entry.title} className="w-full h-full object-cover" />
                : <Video className="w-6 h-6 text-primary/30" />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm line-clamp-2 mb-1">{entry.title}</p>
              <p className="text-xs text-accent font-medium">Resume from {formatTime(entry.time)}</p>
              {entry.duration && <p className="text-xs text-muted-foreground mt-0.5">{entry.duration}</p>}
            </div>
            <button
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
              onClick={e => { e.stopPropagation(); dismiss(entry.id); }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeedVideoModal({ video, onClose }: { video: FeedVideo; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{video.title}</DialogTitle>
        <div className="relative">
          <video src={video.videoUrl} controls autoPlay className="w-full aspect-video bg-black" style={{ maxHeight: "70vh" }} />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
          <div className="bg-black/90 text-white px-5 py-3">
            <p className="font-bold text-base truncate">{video.title}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats();
  const { data: feed, isLoading: feedLoading } = useGetLatestFeed();
  const { data: pillars, isLoading: pillarsLoading } = useListPillars();
  const { recentlyViewed, clearHistory } = useRecentlyViewed();
  const [playingVideo, setPlayingVideo] = useState<FeedVideo | null>(null);

  function openFeedVideo(item: FeedVideo) {
    if ((item as any).videoUrl) {
      fetch(`/api/subjects/${item.subjectId}/videos/${item.id}/view`, { method: "POST" }).catch(() => {});
      setPlayingVideo(item);
    }
  }

  const latestReel = feed?.find((item) => item.type === "video" && (item as any).subtype === "reel");
  const latestArticle = feed?.find((item) => item.type === "pdf");
  const latestVideos = feed?.filter((item) => item.type === "video").slice(0, 3) ?? [];
  const otherFeed = feed?.filter(
    (item) => item.id !== latestReel?.id && item.id !== latestArticle?.id
  ).slice(0, 4) ?? [];

  return (
    <Layout>
      {playingVideo && <FeedVideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />}
      <ContinueWatchingSection onPlay={v => setPlayingVideo(v)} />
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-primary text-primary-foreground border-b border-primary-border">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-serif text-accent mb-6" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </h2>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 max-w-4xl mx-auto leading-tight">
            The Light of Knowledge, <br className="hidden md:block" />
            <span className="text-accent/90">Preserved for the Seekers</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-primary-foreground/80">
            A dignified, scholarly Islamic learning platform dedicated to the preservation and transmission of classical knowledge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/subjects">
              <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8">
                Explore Subjects
              </Button>
            </Link>
            <Link href="/pillars">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/20 hover:bg-primary-foreground/10 text-lg px-8 text-primary-foreground">
                The 5 Pillars
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {[
                { icon: <Library className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalSubjects, label: "Subjects" },
                { icon: <Video className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalVideos, label: "Videos" },
                { icon: <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalPdfs, label: "PDFs" },
                { icon: <ImageIcon className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalImages, label: "Reading Room" },
                { icon: <BrainCircuit className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalQuizzes, label: "Quizzes" },
                { icon: <Book className="w-6 h-6 mx-auto mb-2 text-primary" />, value: stats.totalPillars, label: "Pillars" },
              ].map(({ icon, value, label }) => (
                <div key={label} className="p-4 rounded-lg bg-background border border-border shadow-sm">
                  {icon}
                  <div className="text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Continue Learning Section — only shown if user has visited subjects */}
      {recentlyViewed.length > 0 && (
        <section className="py-14 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground">Continue Learning</h2>
                <p className="text-sm text-muted-foreground">Pick up where you left off</p>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear history
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewed.map((subject, idx) => (
              <Link key={subject.id} href={`/subjects/${subject.id}`}>
                <div className="group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden">
                  {/* Coloured left accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: subject.color ?? "var(--primary)" }}
                  />
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-white font-serif text-lg font-bold"
                    style={{ backgroundColor: subject.color ?? "var(--primary)" }}
                    dir="rtl"
                  >
                    {subject.arabicName.split("")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {idx === 0 && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-accent/15 text-accent border-0">Last visited</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">{subject.name}</h3>
                    <p className="text-xs text-muted-foreground truncate" dir="rtl">{subject.arabicName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Video className="w-3 h-3" /> {subject.videoCount}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <FileText className="w-3 h-3" /> {subject.pdfCount}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Progress Tracker */}
      <ProgressSection />

      {/* How to Navigate Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-3xl mb-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-3">How to Use Al-Mishkat</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know to find knowledge on this platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/subjects">
            <div className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">6 Subject Modules</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Browse <strong className="text-foreground">Aqidah, Tafsir, Hadith, Fiqh, Tarbiyah,</strong> and <strong className="text-foreground">Sirah</strong>. Each subject has its own Video Hub, PDF Library, Reading Room, and Exam Center.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Go to Subjects <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/pillars">
            <div className="group p-7 rounded-2xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-white transition-colors">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">The Five Pillars</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Explore the <strong className="text-foreground">foundations of Islam</strong> — Shahadah, Salah, Zakat, Sawm, and Hajj. Each pillar has a detailed page with Quranic references and a Q&amp;A section.
              </p>
              <div className="mt-4 flex items-center text-accent text-sm font-medium">
                Explore the Pillars <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link href="/search">
            <div className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Search Everything</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Use the <strong className="text-foreground">search bar</strong> at the top of any page to find videos, PDFs, topics, or scholars. Filter by type to narrow your results instantly.
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-medium">
                Search the Library <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 5 Pillars Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">The Five Pillars of Islam</h2>
              <p className="text-muted-foreground mt-2">The foundation of every Muslim's practice</p>
            </div>
            <Link href="/pillars">
              <Button variant="ghost" className="hidden sm:flex group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {pillarsLoading ? (
            <LoadingState message="Loading Pillars..." />
          ) : pillars && pillars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pillars.sort((a, b) => a.order - b.order).map((pillar) => (
                <Link key={pillar.id} href={`/pillars/${pillar.id}`}>
                  <Card className="h-full hover-elevate transition-all border-border hover:border-primary/50 cursor-pointer group bg-background">
                    <CardContent className="p-6 text-center flex flex-col items-center h-full">
                      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <span className="font-serif text-lg" dir="rtl">{pillar.arabicName}</span>
                      </div>
                      <Badge variant="outline" className="mb-2 text-xs text-muted-foreground border-border">Pillar {pillar.order}</Badge>
                      <h3 className="font-bold text-lg mb-2">{pillar.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">{pillar.shortDescription}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Highlighted: Latest Reel + Latest Article */}
      {feed && feed.length > 0 && (latestReel || latestArticle) && (
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Just Added</h2>
              <p className="text-muted-foreground mt-2">The most recently uploaded content</p>
            </div>
            <Link href="/subjects">
              <Button variant="ghost" className="hidden sm:flex group">
                Browse All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestReel && (
              <Card
                className="overflow-hidden hover-elevate border-border hover:border-primary/30 transition-all cursor-pointer flex flex-col h-full"
                onClick={() => (latestReel as any).videoUrl ? openFeedVideo(latestReel as any) : undefined}
              >
                <div className="relative aspect-video bg-muted overflow-hidden group">
                  {latestReel.thumbnailUrl ? (
                    <img src={latestReel.thumbnailUrl} alt={latestReel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Video className="w-12 h-12 text-primary opacity-30" />
                    </div>
                  )}
                  {(latestReel as any).videoUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <PlayCircle className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-accent text-accent-foreground border-0 shadow-sm">Latest Reel</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">{latestReel.subjectName}</div>
                  <h3 className="font-bold text-xl mb-2 line-clamp-2">{latestReel.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{latestReel.description}</p>
                  {(latestReel as any).viewCount !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                      <Eye className="w-3 h-3" />{(latestReel as any).viewCount.toLocaleString()} views
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {latestArticle && (
              <Link href={`/subjects/${latestArticle.subjectId}`}>
                <Card className="overflow-hidden hover-elevate border-border hover:border-primary/30 transition-all cursor-pointer flex flex-col h-full">
                  <div className="relative h-40 bg-primary/5 flex items-center justify-center border-b border-border">
                    <div className="text-center space-y-2 px-8">
                      <FileText className="w-12 h-12 text-primary/40 mx-auto" />
                      <p className="text-sm text-muted-foreground font-medium">{(latestArticle as any).subtype ?? "Document"}</p>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-primary-foreground border-0 shadow-sm">Latest Article</Badge>
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">{latestArticle.subjectName}</div>
                    <h3 className="font-bold text-xl mb-2 line-clamp-2">{latestArticle.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{latestArticle.description}</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Latest Additions Feed */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground">Latest Additions</h2>
              <p className="text-muted-foreground mt-2">Recently added scholarly resources</p>
            </div>
            {feed && feed.length > 0 && (
              <Link href="/subjects">
                <Button variant="ghost" className="hidden sm:flex group">
                  Browse Library <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>

          {feedLoading ? (
            <LoadingState message="Loading recent resources..." />
          ) : feed && otherFeed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherFeed.map((item) => {
                const hasVideo = item.type === "video" && !!(item as any).videoUrl;
                const CardWrapper = ({ children }: { children: React.ReactNode }) => hasVideo ? (
                  <Card className="h-full overflow-hidden hover-elevate border-border hover:border-primary/30 transition-all cursor-pointer flex flex-col" onClick={() => openFeedVideo(item as any)}>{children}</Card>
                ) : (
                  <Link href={`/subjects/${item.subjectId}`}><Card className="h-full overflow-hidden hover-elevate border-border hover:border-primary/30 transition-all cursor-pointer flex flex-col">{children}</Card></Link>
                );
                return (
                  <CardWrapper key={item.id}>
                    <div className="relative aspect-video bg-muted overflow-hidden group">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                          {item.type === "video" && <Video className="w-10 h-10 opacity-30" />}
                          {item.type === "pdf" && <FileText className="w-10 h-10 opacity-30" />}
                        </div>
                      )}
                      {hasVideo && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <PlayCircle className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-foreground/80 text-background text-xs font-semibold shadow-sm border-0">
                          {item.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="text-xs font-medium text-accent mb-2 uppercase tracking-wider">{item.subjectName}</div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      {(item as any).viewCount !== undefined && (item as any).viewCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-3">
                          <Eye className="w-3 h-3" />{(item as any).viewCount.toLocaleString()} views
                        </div>
                      )}
                    </CardContent>
                  </CardWrapper>
                );
              })}
            </div>
          ) : !feedLoading && (!feed || feed.length === 0) ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-3 text-foreground">Content Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                Videos and PDFs uploaded through the Admin panel will appear here as your latest additions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/subjects">
                  <Button variant="outline">Explore Subjects</Button>
                </Link>
                <Link href="/pillars">
                  <Button variant="outline">The Five Pillars</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </Layout>
  );
}
