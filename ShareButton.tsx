import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  text?: string;
  size?: "sm" | "md";
  variant?: "icon" | "text";
  className?: string;
}

export function ShareButton({ title, text, size = "md", variant = "icon", className }: ShareButtonProps) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${title}${text ? `\n${text}` : ""}\n\n${url}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  if (variant === "text") {
    return (
      <Button
        variant="outline"
        size={size === "sm" ? "sm" : "default"}
        asChild
        className={className}
      >
        <a href={waUrl} target="_blank" rel="noreferrer">
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Share
        </a>
      </Button>
    );
  }

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noreferrer"
      onClick={e => e.stopPropagation()}
      aria-label="Share via WhatsApp"
      title="Share via WhatsApp"
      className={`rounded-full flex items-center justify-center border border-border bg-card/80 text-muted-foreground hover:text-green-600 hover:border-green-500/50 transition-all duration-200 shrink-0 ${
        size === "sm" ? "w-7 h-7" : "w-9 h-9"
      } ${className ?? ""}`}
    >
      <Share2 className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
    </a>
  );
}
