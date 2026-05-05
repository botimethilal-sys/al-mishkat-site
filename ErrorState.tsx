import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "An error occurred", 
  message = "We couldn't load the requested content. Please try again.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-border rounded-lg bg-card/50">
      <div className="w-12 h-12 bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-serif font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} data-testid="button-retry">
          Try Again
        </Button>
      )}
    </div>
  );
}
