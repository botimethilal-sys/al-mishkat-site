import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { useSearchContent } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Video, FileText, Image as ImageIcon, Book, Library } from "lucide-react";
import type { SearchContentType } from "@workspace/api-client-react";

export default function Search() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const queryParams = new URLSearchParams(searchString);
  const initialQuery = queryParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState<SearchContentType | undefined>(undefined);

  // Update URL and active query when user submits
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveQuery(query);
      const params = new URLSearchParams();
      params.set("q", query);
      if (filterType) params.set("type", filterType);
      setLocation(`/search?${params.toString()}`);
    }
  };

  const handleFilterChange = (val: string) => {
    const type = val === "all" ? undefined : val as SearchContentType;
    setFilterType(type);
    
    if (activeQuery) {
      const params = new URLSearchParams();
      params.set("q", activeQuery);
      if (type) params.set("type", type);
      setLocation(`/search?${params.toString()}`);
    }
  };

  const { data: results, isLoading, isError, refetch } = useSearchContent(
    { q: activeQuery, type: filterType },
    { query: { enabled: !!activeQuery, queryKey: ['/api/search', { q: activeQuery, type: filterType }] } }
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h1 className="text-4xl font-serif font-bold mb-6">Search Library</h1>
          <form onSubmit={handleSearch} className="relative flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by topic, book, author, or keyword..."
                className="w-full bg-card pl-12 pr-4 py-6 text-lg rounded-xl border-border/50 shadow-sm focus-visible:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="input-main-search"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl px-8 h-auto" data-testid="button-submit-search">
              Search
            </Button>
          </form>
        </div>

        {!activeQuery ? (
          <div className="py-20 text-center text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl">Enter a search term to find resources</p>
          </div>
        ) : isLoading ? (
          <LoadingState message={`Searching for "${activeQuery}"...`} />
        ) : isError ? (
          <ErrorState message="Failed to complete search." onRetry={() => refetch()} />
        ) : results ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold">
                Found {results.totalResults} results for "{activeQuery}"
              </h2>
              
              <Tabs value={filterType || "all"} onValueChange={handleFilterChange}>
                <TabsList className="bg-card">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                  <TabsTrigger value="pdf">PDFs</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="subject">Subjects</TabsTrigger>
                  <TabsTrigger value="pillar">Pillars</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {results.totalResults === 0 ? (
              <EmptyState title="No results found" message="Try adjusting your search terms or filters." />
            ) : (
              <div className="space-y-12">
                {/* Subjects */}
                {results.subjects.length > 0 && (
                  <section>
                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                      <Library className="w-5 h-5 text-primary" /> Subjects ({results.subjects.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.subjects.map(item => (
                        <Card key={item.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation(`/subjects/${item.id}`)}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                              <span className="font-serif text-xl" dir="rtl">{item.arabicName}</span>
                            </div>
                            <div>
                              <h4 className="font-bold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Pillars */}
                {results.pillars.length > 0 && (
                  <section>
                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                      <Book className="w-5 h-5 text-primary" /> Pillars ({results.pillars.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.pillars.map(item => (
                        <Card key={item.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation(`/pillars/${item.id}`)}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
                              <span className="font-serif text-xl" dir="rtl">{item.arabicName}</span>
                            </div>
                            <div>
                              <h4 className="font-bold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.shortDescription}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Videos */}
                {results.videos.length > 0 && (
                  <section>
                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" /> Videos ({results.videos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.videos.map(item => (
                        <Card key={item.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation(`/subjects/${item.subjectId}`)}>
                          <div className="aspect-video bg-muted relative">
                            {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />}
                            <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur" variant="secondary">{item.type}</Badge>
                          </div>
                          <CardContent className="p-4">
                            <h4 className="font-bold line-clamp-1 mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* PDFs */}
                {results.pdfs.length > 0 && (
                  <section>
                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" /> Documents ({results.pdfs.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.pdfs.map(item => (
                        <Card key={item.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation(`/subjects/${item.subjectId}`)}>
                          <CardContent className="p-4 flex gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm line-clamp-2 mb-1">{item.title}</h4>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-[10px] h-5">{item.category}</Badge>
                                <span className="flex items-center">{item.pageCount} pgs</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}

                {/* Images */}
                {results.images.length > 0 && (
                  <section>
                    <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" /> Reading Room Snippets ({results.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {results.images.map(item => (
                        <Card key={item.id} className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setLocation(`/subjects/${item.subjectId}`)}>
                          <div className="aspect-[3/4] bg-muted relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-bold text-sm line-clamp-1 mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.bookTitle}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
