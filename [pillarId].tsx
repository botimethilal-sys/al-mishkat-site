import { useState } from "react";
import { useParams } from "wouter";
import { useGetPillar } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { QuestionForm } from "@/components/forms/QuestionForm";
import { BookmarkButton } from "@/components/shared/BookmarkButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PlayCircle, ExternalLink, Quote, X } from "lucide-react";

function VideoPlayerModal({ video, onClose }: { video: any; onClose: () => void }) {
  const isExternal = video.videoUrl.startsWith("http://") || video.videoUrl.startsWith("https://");
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-0">
        <DialogTitle className="sr-only">{video.title}</DialogTitle>
        <div className="relative">
          {isExternal ? (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-4 p-8 text-center">
              <PlayCircle className="w-16 h-16 text-white/40" />
              <p className="font-bold text-lg">{video.title}</p>
              <a href={video.videoUrl} target="_blank" rel="noreferrer"
                className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Open Video ↗
              </a>
            </div>
          ) : (
            <video src={video.videoUrl} controls autoPlay className="w-full aspect-video bg-black" style={{ maxHeight: "70vh" }} />
          )}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-zinc-900 text-white p-5">
          <h2 className="font-bold text-lg">{video.title}</h2>
          {video.description && <p className="text-white/60 text-sm mt-1">{video.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PillarDetail() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const { data: pillar, isLoading, isError, refetch } = useGetPillar(pillarId, {
    query: { enabled: !!pillarId, queryKey: ['/api/pillars', pillarId] }
  });

  if (isLoading) return <Layout><LoadingState message="Loading pillar details..." /></Layout>;
  if (isError || !pillar) return <Layout><ErrorState message="Failed to load pillar." onRetry={() => refetch()} /></Layout>;

  return (
    <Layout>
      {selectedVideo && <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}

      <div className="bg-primary text-primary-foreground py-20 border-b border-primary-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-80" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 text-accent mb-6 border border-accent/30 backdrop-blur-sm">
            <span className="font-serif text-3xl font-bold">{pillar.order}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-accent mb-4 font-bold" dir="rtl">{pillar.arabicName}</h2>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">{pillar.name}</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed">{pillar.description}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">

        {pillar.arabicText && (
          <div className="my-12 p-8 md:p-12 bg-card border border-border rounded-2xl relative shadow-sm">
            <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/20 rotate-180" />
            <p className="text-2xl md:text-4xl font-serif text-center leading-loose text-primary py-4" dir="rtl">
              {pillar.arabicText}
            </p>
            <Quote className="absolute bottom-6 right-6 w-8 h-8 text-primary/20" />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-12 mt-16">
          <div className="md:col-span-2 space-y-12">
            {/* Videos */}
            {pillar.videos && pillar.videos.length > 0 && (
              <section>
                <h3 className="text-2xl font-serif font-bold mb-6 pb-2 border-b border-border">Scholarly Insights</h3>
                <div className="grid gap-6">
                  {pillar.videos.map((video: any) => (
                    <Card key={video.id} className="overflow-hidden bg-card border-border group cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedVideo(video)}>
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto relative bg-muted shrink-0">
                          {video.thumbnailUrl ? (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                              <PlayCircle className="w-12 h-12 text-primary opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <PlayCircle className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          {/* Bookmark on thumbnail */}
                          <div className="absolute top-2 right-2">
                            <BookmarkButton
                              size="sm"
                              item={{
                                id: `pillar-video-${video.id}`,
                                type: "video",
                                title: video.title,
                                description: video.description ?? undefined,
                                url: video.videoUrl,
                                thumbnailUrl: video.thumbnailUrl,
                                contextName: pillar.name,
                                contextId: pillarId,
                                contextType: "pillar",
                                savedAt: Date.now(),
                              }}
                            />
                          </div>
                        </div>
                        <CardContent className="p-5 flex-1 flex flex-col justify-center">
                          <h4 className="font-bold text-lg mb-2">{video.title}</h4>
                          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">{video.description}</p>
                          <Button variant="outline" size="sm" className="self-start mt-auto" onClick={e => { e.stopPropagation(); setSelectedVideo(video); }}>
                            <PlayCircle className="w-4 h-4 mr-2" /> Watch Video
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-12">
            {/* Resources/Links */}
            {pillar.links && pillar.links.length > 0 && (
              <section className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-serif font-bold mb-4">Further Reading</h3>
                <div className="space-y-4">
                  {pillar.links.map((link: any, idx: number) => (
                    <div key={idx} className="group relative">
                      <a href={link.url} target="_blank" rel="noreferrer" className="block">
                        <div className="p-4 rounded-lg bg-background border border-border group-hover:border-primary/50 transition-colors pr-10">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1 pr-2">{link.title}</h4>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{link.description}</p>
                        </div>
                      </a>
                      {/* Bookmark button for link */}
                      <div className="absolute top-2 right-2">
                        <BookmarkButton
                          size="sm"
                          item={{
                            id: `pillar-link-${pillarId}-${idx}`,
                            type: "link",
                            title: link.title,
                            description: link.description ?? undefined,
                            url: link.url,
                            contextName: pillar.name,
                            contextId: pillarId,
                            contextType: "pillar",
                            savedAt: Date.now(),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mt-20">
          <QuestionForm contextId={pillar.id} type="pillar" />
        </div>
      </div>
    </Layout>
  );
}
