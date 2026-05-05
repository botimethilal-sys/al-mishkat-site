import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface PdfViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PdfViewerModal({ url, title, onClose }: PdfViewerModalProps) {
  return (
    <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-zinc-900 border-0 flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-800 text-white shrink-0 border-b border-zinc-700">
          <h2 className="font-semibold text-base line-clamp-1 flex-1 mr-4">{title}</h2>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="secondary" className="bg-zinc-700 hover:bg-zinc-600 text-white border-0 text-xs" asChild>
              <a href={url} target="_blank" rel="noreferrer" download>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download
              </a>
            </Button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        {/* PDF Viewer */}
        <iframe
          src={`${url}#toolbar=1&view=FitH`}
          className="flex-1 w-full h-full border-0"
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}
