import { BookOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

const defaultQuotes = [
  "Seeking knowledge is an obligation upon every Muslim.",
  "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.",
  "Read! In the name of your Lord who created.",
];

export function EmptyState({ 
  title = "No content found", 
  message, 
  icon = <BookOpen className="w-8 h-8 text-primary" /> 
}: EmptyStateProps) {
  const quote = message || defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] border border-dashed border-border rounded-lg bg-card/30">
      <div className="w-16 h-16 bg-primary/10 flex items-center justify-center rounded-full mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-serif font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground max-w-md italic">{quote}</p>
    </div>
  );
}
