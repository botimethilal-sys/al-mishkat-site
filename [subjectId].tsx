import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  useGetSubject, 
  useListSubjectVideos, 
  useListSubjectPdfs, 
  useListSubjectImages, 
  useListSubjectQuizzes,
  getListSubjectVideosQueryKey
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { QuestionForm } from "@/components/forms/QuestionForm";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { ShareButton } from "@/components/shared/ShareButton";
import { PdfViewerModal } from "@/components/shared/PdfViewerModal";
import { NoteEditor } from "@/components/shared/NoteEditor";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Video, FileText, Image as ImageIcon, BrainCircuit, Download, PlayCircle, BookOpen, X, Eye, ArrowUpDown, Clock } from "lucide-react";
import type { VideoItemType } from "@workspace/api-client-react";

const CW_PREFIX = "almishkat_cw_";

type VideoItem = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string | null;
  tags?: string[];
};

function VideoPlayerModal({ video, onClose }: { video: VideoItem; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isExternalUrl = video.videoUrl.startsWith("http://") || video.videoUrl.startsWith("https://");

  useEffect(() => {
    if (isExternalUrl) return;
    const saved = localStorage.getItem(CW_PREFIX + video.id);
    if (saved) {
      try {
        const { time } = JSON.parse(saved);
        if (videoRef.current && time > 0) videoRef.current.currentTime = time;
      } catch {}
    }
  }, [video.id, isExternalUrl]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.duration < 10) return;
    const time = v.currentTime;
    const progress = time / v.duration;
    if (progress > 0.95) {
      localStorage.removeItem(CW_PREFIX + video.id);
    } else {
      localStorage.setItem(CW_PREFIX + video.id, JSON.stringify({
        time,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl ?? null,
        videoUrl: video.videoUrl,
        duration: video.duration ?? "",
        savedAt: Date.now(),
      }));
    }
  }, [video]);

  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{video.title}</DialogTitle>
        <div className="relative">
          {isExternalUrl ? (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-4 p-8 text-center">
              <PlayCircle className="w-16 h-16 text-white/40" />
              <p className="font-bold text-lg">{video.title}</p>
              <a href={video.videoUrl} target="_blank" rel="noreferrer"
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Open Video ↗
              </a>
            </div>
          ) : (
            <video ref={videoRef} src={video.videoUrl} controls autoPlay onTimeUpdate={handleTimeUpdate}
              className="w-full aspect-video bg-black" style={{ maxHeight: "70vh" }} />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-zinc-900 text-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg leading-snug">{video.title}</h2>
              {video.description && <p className="text-white/60 text-sm mt-1">{video.description}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="capitalize">{video.type}</Badge>
              {video.duration && <span className="text-white/50 text-xs">{video.duration}</span>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function parseDurationMins(dur: string | null | undefined): number {
  if (!dur) return 0;
  const parts = dur.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 60 + parts[1];
  if (parts.length === 2) return parts[0];
  return 0;
}

export default function SubjectDetail() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [, setLocation] = useLocation();
  const [videoFilter, setVideoFilter] = useState<VideoItemType | undefined>(undefined);
  const [videoSort, setVideoSort] = useState<"newest" | "oldest" | "most-viewed">("newest");
  const [durationFilter, setDurationFilter] = useState<"all" | "short" | "medium" | "long">("all");
  const [pdfSort, setPdfSort] = useState<"newest" | "oldest">("newest");
  const [pdfCategoryFilter, setPdfCategoryFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);
  const { trackVisit } = useRecentlyViewed();

  const { data: subject, isLoading: subjectLoading, isError: subjectError, refetch: refetchSubject } = useGetSubject(subjectId, {
    query: { enabled: !!subjectId, queryKey: ['/api/subjects', subjectId] }
  });

  useEffect(() => {
    if (subject) {
      trackVisit({
        id: subject.id,
        name: subject.name,
        arabicName: subject.arabicName,
        description: subject.description,
        color: subject.color,
        videoCount: subject.videoCount ?? 0,
        pdfCount: subject.pdfCount ?? 0,
      });
    }
  }, [subject?.id]);

  const { data: videos, isLoading: videosLoading } = useListSubjectVideos(subjectId, { type: videoFilter }, {
    query: { enabled: !!subjectId, queryKey: getListSubjectVideosQueryKey(subjectId, { type: videoFilter }) }
  });

  const { data: pdfs, isLoading: pdfsLoading } = useListSubjectPdfs(subjectId, {
    query: { enabled: !!subjectId, queryKey: ['/api/subjects', subjectId, 'pdfs'] }
  });

  const { data: images, isLoading: imagesLoading } = useListSubjectImages(subjectId, {
    query: { enabled: !!subjectId, queryKey: ['/api/subjects', subjectId, 'images'] }
  });

  const { data: quizzes, isLoading: quizzesLoading } = useListSubjectQuizzes(subjectId, {
    query: { enabled: !!subjectId, queryKey: ['/api/subjects', subjectId, 'quizzes'] }
  });

  if (subjectLoading) return <Layout><LoadingState message="Loading subject details..." /></Layout>;
  if (subjectError || !subject) return <Layout><ErrorState message="Failed to load subject." onRetry={() => refetchSubject()} /></Layout>;

  return (
    <Layout>
      {selectedVideo && <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
      {viewingPdf && <PdfViewerModal url={viewingPdf.url} title={viewingPdf.title} onClose={() => setViewingPdf(null)} />}

      {/* Subject Header */}
      <div className="bg-primary text-primary-foreground py-16 border-b border-primary-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm border border-primary-foreground/20">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <span className="font-serif text-4xl text-accent font-bold" dir="rtl">{subject.arabicName}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{subject.name}</h1>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">{subject.description}</p>
            </div>
            <div className="flex gap-4 md:flex-col shrink-0">
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
                <Video className="w-5 h-5 text-accent" />
                <span className="font-medium">{subject.videoCount} Videos</span>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
                <FileText className="w-5 h-5 text-accent" />
                <span className="font-medium">{subject.pdfCount} PDFs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="videos" className="space-y-8">
          <TabsList className="bg-card border border-border w-full justify-start p-1 h-auto flex-wrap">
            <TabsTrigger value="videos" className="py-3 px-6 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4 mr-2" /> Video Hub
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="py-3 px-6 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" /> PDF Library
            </TabsTrigger>
            <TabsTrigger value="images" className="py-3 px-6 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ImageIcon className="w-4 h-4 mr-2" /> Reading Room
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="py-3 px-6 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BrainCircuit className="w-4 h-4 mr-2" /> Exam Center
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6 min-h-[400px]">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {(["all", "lecture", "short", "reel"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={videoFilter === (f === "all" ? undefined : f) ? "default" : "outline"}
                    onClick={() => setVideoFilter(f === "all" ? undefined : f)}
                    className="rounded-full capitalize shrink-0"
                    size="sm"
                  >
                    {f === "all" ? "All" : f + "s"}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap sm:ml-auto">
                <select
                  value={durationFilter}
                  onChange={e => setDurationFilter(e.target.value as any)}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Any length</option>
                  <option value="short">Short (&lt;15 min)</option>
                  <option value="medium">Medium (15–45 min)</option>
                  <option value="long">Long (&gt;45 min)</option>
                </select>
                <select
                  value={videoSort}
                  onChange={e => setVideoSort(e.target.value as any)}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="most-viewed">Most viewed</option>
                </select>
              </div>
            </div>

            {videosLoading ? (
              <LoadingState message="Loading videos..." />
            ) : videos && videos.length > 0 ? (() => {
              let displayed = [...videos];
              if (durationFilter !== "all") {
                displayed = displayed.filter(v => {
                  const mins = parseDurationMins((v as any).duration);
                  if (durationFilter === "short") return mins > 0 && mins < 15;
                  if (durationFilter === "medium") return mins >= 15 && mins <= 45;
                  if (durationFilter === "long") return mins > 45;
                  return true;
                });
              }
              if (videoSort === "oldest") displayed.sort((a, b) => a.id.localeCompare(b.id));
              else if (videoSort === "most-viewed") displayed.sort((a, b) => ((b as any).viewCount ?? 0) - ((a as any).viewCount ?? 0));
              return displayed.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayed.map(video => (
                  <Card
                    key={video.id}
                    className="overflow-hidden hover-elevate border-border bg-card group cursor-pointer"
                    onClick={() => {
                      setSelectedVideo(video as VideoItem);
                      fetch(`/api/subjects/${subjectId}/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
                    }}
                  >
                    <div className="relative aspect-video bg-muted">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <PlayCircle className="w-12 h-12 text-primary opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <PlayCircle className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                          {video.duration}
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 capitalize" variant="secondary">{video.type}</Badge>
                      <div className="absolute top-2 right-2 flex gap-1" onClick={e => e.stopPropagation()}>
                        <BookmarkButton
                          size="sm"
                          item={{
                            id: `video-${video.id}`,
                            type: "video",
                            title: video.title,
                            description: video.description ?? undefined,
                            url: video.videoUrl,
                            thumbnailUrl: video.thumbnailUrl,
                            contextName: subject.name,
                            contextId: subjectId,
                            contextType: "subject",
                            savedAt: Date.now(),
                          }}
                        />
                        <NoteEditor itemId={`video-${video.id}`} itemTitle={video.title} size="sm" />
                        <ShareButton size="sm" title={video.title} text={video.description ?? undefined} />
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{video.description}</p>
                      {(video as any).viewCount !== undefined && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <Eye className="w-3 h-3" />
                          <span>{(video as any).viewCount.toLocaleString()} {(video as any).viewCount === 1 ? "view" : "views"}</span>
                        </div>
                      )}
                      {(video as any).tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(video as any).tags.map((tag: string) => (
                            <Link key={tag} href={`/library?tag=${encodeURIComponent(tag)}`} onClick={e => e.stopPropagation()}>
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">{tag}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedVideo(video as VideoItem);
                          fetch(`/api/subjects/${subjectId}/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
                        }}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" /> Watch Video
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              ) : <EmptyState title="No matches" message="Try changing your filters." icon={<Video className="w-8 h-8 text-primary" />} />;
            })() : (
              <EmptyState title="No videos yet" message="Videos uploaded via the Admin panel will appear here." icon={<Video className="w-8 h-8 text-primary" />} />
            )}
          </TabsContent>

          {/* PDFs Tab */}
          <TabsContent value="pdfs" className="space-y-6 min-h-[400px]">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {["all", "general", "classical", "contemporary", "reference"].map(cat => (
                  <Button key={cat} size="sm" variant={pdfCategoryFilter === cat ? "default" : "outline"}
                    onClick={() => setPdfCategoryFilter(cat)} className="rounded-full capitalize">
                    {cat === "all" ? "All" : cat}
                  </Button>
                ))}
              </div>
              <select
                value={pdfSort}
                onChange={e => setPdfSort(e.target.value as any)}
                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            {pdfsLoading ? (
              <LoadingState message="Loading PDFs..." />
            ) : pdfs && pdfs.length > 0 ? (() => {
              let displayedPdfs = [...pdfs];
              if (pdfCategoryFilter !== "all") displayedPdfs = displayedPdfs.filter(p => p.category === pdfCategoryFilter);
              if (pdfSort === "oldest") displayedPdfs.sort((a, b) => a.id.localeCompare(b.id));
              return displayedPdfs.length > 0 ? (
              <div className="space-y-4">
                {displayedPdfs.map(pdf => (
                  <div key={pdf.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{pdf.title}</h3>
                        <Badge variant="outline" className="capitalize text-xs">{pdf.category}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{pdf.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {pdf.pageCount && <span>{pdf.pageCount} pages</span>}
                        {pdf.pageCount && pdf.fileSize && <span>•</span>}
                        {pdf.fileSize && <span>{pdf.fileSize}</span>}
                        {(pdf as any).tags?.length > 0 && (
                          <span className="flex flex-wrap gap-1">
                            {(pdf as any).tags.map((tag: string) => (
                              <Link key={tag} href={`/library?tag=${encodeURIComponent(tag)}`}>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer">{tag}</span>
                              </Link>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:self-center shrink-0 flex-wrap">
                      <BookmarkButton
                        item={{
                          id: `pdf-${pdf.id}`,
                          type: "pdf",
                          title: pdf.title,
                          description: pdf.description ?? undefined,
                          url: pdf.downloadUrl,
                          contextName: subject.name,
                          contextId: subjectId,
                          contextType: "subject",
                          savedAt: Date.now(),
                        }}
                      />
                      <NoteEditor itemId={`pdf-${pdf.id}`} itemTitle={pdf.title} />
                      <ShareButton title={pdf.title} text={pdf.description ?? undefined} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingPdf({ url: pdf.downloadUrl, title: pdf.title })}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Read
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={pdf.downloadUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              ) : <EmptyState title="No matches" message="Try a different category filter." icon={<FileText className="w-8 h-8 text-primary" />} />;
            })() : (
              <EmptyState title="No PDFs yet" message="Documents uploaded via the Admin panel will appear here." icon={<FileText className="w-8 h-8 text-primary" />} />
            )}
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6 min-h-[400px]">
            {imagesLoading ? (
              <LoadingState message="Loading images..." />
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map(image => (
                  <Card key={image.id} className="overflow-hidden hover-elevate border-border bg-card">
                    <div className="relative aspect-[3/4] bg-muted">
                      <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1 truncate">{image.title}</h3>
                      <div className="text-sm text-muted-foreground mb-3 space-y-1">
                        <p><span className="font-medium text-foreground">Book:</span> {image.bookTitle}</p>
                        <p><span className="font-medium text-foreground">Author:</span> {image.author}</p>
                        <p><span className="font-medium text-foreground">Pages:</span> {image.pageRange}</p>
                      </div>
                      <Button variant="secondary" className="w-full" asChild>
                        <a href={image.downloadUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Save Image
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No reading snippets yet" message="Reading room content will appear here." icon={<ImageIcon className="w-8 h-8 text-primary" />} />
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6 min-h-[400px]">
            {quizzesLoading ? (
              <LoadingState message="Loading quizzes..." />
            ) : quizzes && quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map(quiz => (
                  <Card key={quiz.id} className="border-border bg-card hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <BrainCircuit className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className={`capitalize ${
                          quiz.difficulty === 'beginner' ? 'text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20' :
                          quiz.difficulty === 'intermediate' ? 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                          'text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20'
                        }`}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-xl mb-2">{quiz.title}</h3>
                      <p className="text-muted-foreground mb-6 line-clamp-2">{quiz.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">{quiz.questionCount} Question{quiz.questionCount !== 1 ? "s" : ""}</span>
                          <span className="text-xs text-muted-foreground ml-2">· Pass at {(quiz as any).passThreshold ?? 70}%</span>
                        </div>
                        <Link href={`/quiz/${subjectId}/${quiz.id}`}>
                          <Button disabled={quiz.questionCount === 0}>
                            {quiz.questionCount === 0 ? "No Questions Yet" : "Start Quiz"}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState title="No quizzes yet" message="Exams for this subject will appear here." icon={<BrainCircuit className="w-8 h-8 text-primary" />} />
            )}
          </TabsContent>
        </Tabs>

        {/* Q&A Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <QuestionForm contextId={subjectId} type="subject" />
        </div>
      </div>
    </Layout>
  );
}
