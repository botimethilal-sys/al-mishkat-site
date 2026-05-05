import { Link } from "wouter";
import { useListSubjects } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, FileText, Video, ImageIcon, BrainCircuit, ChevronRight } from "lucide-react";

export default function SubjectsIndex() {
  const { data: subjects, isLoading, isError, refetch } = useListSubjects();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">Islamic Subjects</h1>
          <p className="text-xl text-muted-foreground">
            Explore our comprehensive curriculum covering the core sciences of Islamic scholarship.
          </p>
        </div>

        {isLoading ? (
          <LoadingState message="Loading subjects..." />
        ) : isError ? (
          <ErrorState message="Failed to load subjects." onRetry={() => refetch()} />
        ) : subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.id}`}>
                <Card className="h-full hover-elevate border-border hover:border-primary/50 transition-all cursor-pointer group bg-card overflow-hidden">
                  <div className="h-2 w-full" style={{ backgroundColor: subject.color || "var(--primary)" }} />
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Book className="w-6 h-6" />
                      </div>
                      <span className="font-serif text-2xl font-bold text-primary" dir="rtl">{subject.arabicName}</span>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{subject.name}</h2>
                    <p className="text-foreground/65 line-clamp-3 mb-6 flex-grow">{subject.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border">
                      <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover-elevate">
                        <Video className="w-3 h-3" /> {subject.videoCount}
                      </Badge>
                      <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover-elevate">
                        <FileText className="w-3 h-3" /> {subject.pdfCount}
                      </Badge>
                      <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover-elevate">
                        <ImageIcon className="w-3 h-3" /> {subject.imageCount}
                      </Badge>
                      <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 hover-elevate">
                        <BrainCircuit className="w-3 h-3" /> {subject.quizCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <ErrorState title="No Subjects Found" message="There are currently no subjects available." />
        )}
      </div>
    </Layout>
  );
}
