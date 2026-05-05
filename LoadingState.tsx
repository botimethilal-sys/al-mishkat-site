import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-primary">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}
