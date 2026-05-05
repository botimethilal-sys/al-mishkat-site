import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload, Video, FileText, CheckCircle, Loader2, Trash2, AlertCircle,
  Lock, BookOpen, Eye, EyeOff, BookMarked, GraduationCap, Plus, Check,
  ChevronRight, MessageSquare, Link as LinkIcon, Inbox, Megaphone, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ADMIN_AUTH_KEY, ADMIN_AUTH_EVENT } from "@/hooks/useAdminAuthStatus";

function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const login = () => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    setIsAuthenticated(true);
  };
  const logout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    window.dispatchEvent(new Event(ADMIN_AUTH_EVENT));
    setIsAuthenticated(false);
  };
  return { isAuthenticated, login, logout };
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { onLogin(); }
      else { setError("Incorrect password. Please try again."); setPassword(""); }
    } catch { setError("Could not connect to server. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Al-Mishkat Admin</h1>
            <p className="text-foreground/60 text-sm">Enter your password to access the content management area.</p>
          </div>
          <Card className="border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={!password || loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : <><Lock className="w-4 h-4 mr-2" /> Enter Admin Panel</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { id: "aqidah", name: "Aqidah" },
  { id: "tafsir", name: "Tafsir" },
  { id: "hadith", name: "Hadith" },
  { id: "fiqh", name: "Fiqh" },
  { id: "tarbiyah", name: "Tarbiyah" },
  { id: "sirah", name: "Sirah" },
];

const PILLARS = [
  { id: "shahadah", name: "Shahadah (Pillar 1)" },
  { id: "salah", name: "Salah (Pillar 2)" },
  { id: "zakah", name: "Zakah (Pillar 3)" },
  { id: "sawm", name: "Sawm (Pillar 4)" },
  { id: "hajj", name: "Hajj (Pillar 5)" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function requestUploadUrl(file: File) {
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  return res.json() as Promise<{ uploadURL: string; objectPath: string }>;
}

function uploadWithProgress(
  uploadURL: string,
  file: File,
  onProgress: (loaded: number, total: number, speedBps: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastLoaded = 0;
    let lastTime = Date.now();
    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable) return;
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      const speed = elapsed > 0.1 ? (e.loaded - lastLoaded) / elapsed : 0;
      lastLoaded = e.loaded;
      lastTime = now;
      onProgress(e.loaded, e.total, speed);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error("Upload to storage failed"));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload to storage failed")));
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

function formatSpeed(bps: number): string {
  if (bps <= 0) return "";
  if (bps >= 1024 * 1024) return ` · ${(bps / 1024 / 1024).toFixed(1)} MB/s`;
  if (bps >= 1024) return ` · ${(bps / 1024).toFixed(0)} KB/s`;
  return ` · ${bps.toFixed(0)} B/s`;
}

function UploadProgress({ progress, label, speedBps }: { progress: number; label: string; speedBps?: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {label}{speedBps !== undefined && speedBps > 0 ? <span className="text-primary font-medium">{formatSpeed(speedBps)}</span> : null}
        </span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ── Video Upload ─────────────────────────────────────────────────────────────

function VideoUploadForm() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState<"subject" | "pillar">("subject");
  const [type, setType] = useState<"lecture" | "short" | "reel">("lecture");
  const [duration, setDuration] = useState("");
  const [progress, setProgress] = useState(0);
  const [speedBps, setSpeedBps] = useState(0);
  const [step, setStep] = useState<"idle" | "uploading" | "uploading-thumb" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function handleThumbnailChange(f: File | undefined) {
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !target) return;
    setError(""); setStep("uploading"); setProgress(10); setSpeedBps(0);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      setProgress(15);
      await uploadWithProgress(uploadURL, file, (loaded, total, speed) => {
        setSpeedBps(speed);
        setProgress(15 + Math.round((loaded / total) * 45));
      });
      setSpeedBps(0); setProgress(60);

      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        setStep("uploading-thumb");
        const { uploadURL: tu, objectPath: tp } = await requestUploadUrl(thumbnailFile);
        await uploadWithProgress(tu, thumbnailFile, (loaded, total, speed) => {
          setSpeedBps(speed);
          setProgress(60 + Math.round((loaded / total) * 20));
        });
        thumbnailUrl = `/api/storage/objects/${tp.replace(/^\/objects\//, '')}`;
        setSpeedBps(0); setProgress(80);
      }

      setStep("saving"); setProgress(90);

      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

      if (targetType === "subject") {
        const res = await fetch("/api/admin/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, subjectId: target, type, duration, objectPath, thumbnailUrl, tags: parsedTags }),
        });
        if (!res.ok) throw new Error("Failed to save video");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      } else {
        const res = await fetch("/api/admin/pillar-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pillarId: target, type: "video_link", title, description, url: objectPath, thumbnailUrl }),
        });
        if (!res.ok) throw new Error("Failed to save video");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pillar-content"] });
      }

      setProgress(100); setStep("done");
      setTimeout(() => {
        setStep("idle"); setProgress(0); setFile(null); setThumbnailFile(null); setThumbnailPreview(null);
        setTitle(""); setDescription(""); setTarget(""); setDuration(""); setTags("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("error"); setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Target selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Add to <span className="text-destructive">*</span></Label>
          <Select value={targetType} onValueChange={v => { setTargetType(v as "subject" | "pillar"); setTarget(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="subject">A Subject</SelectItem>
              <SelectItem value="pillar">A Pillar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{targetType === "subject" ? "Subject" : "Pillar"} <span className="text-destructive">*</span></Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue placeholder={`Select ${targetType}`} /></SelectTrigger>
            <SelectContent>
              {(targetType === "subject" ? SUBJECTS : PILLARS).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Video File <span className="text-destructive">*</span></Label>
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => document.getElementById("video-file-input")?.click()}>
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <Video className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm truncate max-w-[160px]">{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
              </div>
            ) : (
              <div className="text-foreground/50 space-y-1">
                <Upload className="w-7 h-7 mx-auto mb-1 opacity-50" />
                <p className="text-sm">Click to select video</p>
                <p className="text-xs">MP4, MOV, AVI, WebM</p>
              </div>
            )}
          </div>
          <input id="video-file-input" type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="space-y-2">
          <Label>Thumbnail <span className="text-foreground/40 text-xs">(optional)</span></Label>
          <div className="border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors relative" style={{ height: "116px" }} onClick={() => document.getElementById("thumb-file-input")?.click()}>
            {thumbnailPreview ? (
              <>
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">Click to change</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/50 space-y-1">
                <Upload className="w-7 h-7 opacity-50" />
                <p className="text-sm">Add thumbnail</p>
                <p className="text-xs">JPG, PNG, WebP</p>
              </div>
            )}
          </div>
          <input id="thumb-file-input" type="file" accept="image/*" className="hidden" onChange={e => handleThumbnailChange(e.target.files?.[0])} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to Aqidah" required />
        </div>
        {targetType === "subject" && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={v => setType(v as "lecture" | "short" | "reel")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lecture">Lecture</SelectItem>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duration <span className="text-foreground/40 text-xs">(optional)</span></Label>
          <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45:00" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of the video..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Tags <span className="text-foreground/40 text-xs">(optional — comma separated)</span></Label>
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. prayer, Quran, fasting" />
      </div>

      {(step === "uploading" || step === "uploading-thumb" || step === "saving") && (
        <UploadProgress progress={progress} speedBps={speedBps} label={step === "uploading" ? "Uploading video..." : step === "uploading-thumb" ? "Uploading thumbnail..." : "Saving..."} />
      )}
      {step === "error" && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" disabled={!file || !title || !target || step === "uploading" || step === "uploading-thumb" || step === "saving"} className="w-full">
        {step === "uploading" || step === "uploading-thumb" || step === "saving" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {step === "uploading" ? "Uploading video..." : step === "uploading-thumb" ? "Uploading thumbnail..." : "Saving..."}</>
        ) : step === "done" ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Uploaded Successfully!</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> Upload Video</>
        )}
      </Button>
    </form>
  );
}

// ── PDF Upload ────────────────────────────────────────────────────────────────

function PdfUploadForm() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState<"subject" | "pillar">("subject");
  const [category, setCategory] = useState("general");
  const [pageCount, setPageCount] = useState("");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !target) return;
    setError(""); setStep("uploading"); setProgress(10);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      setProgress(30);
      await uploadToStorage(uploadURL, file);
      setProgress(80); setStep("saving");

      const fileSize = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / 1024 / 1024).toFixed(1)} MB`;

      const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

      if (targetType === "subject") {
        const res = await fetch("/api/admin/pdfs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, subjectId: target, category, pageCount: parseInt(pageCount) || 0, fileSize, objectPath, tags: parsedTags }),
        });
        if (!res.ok) throw new Error("Failed to save PDF");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] });
      } else {
        const res = await fetch("/api/admin/pillar-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pillarId: target, type: "pdf", title, description, url: objectPath }),
        });
        if (!res.ok) throw new Error("Failed to save PDF");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pillar-content"] });
      }

      setProgress(100); setStep("done");
      setTimeout(() => {
        setStep("idle"); setProgress(0); setFile(null);
        setTitle(""); setDescription(""); setTarget(""); setPageCount(""); setTags("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("error"); setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Add to <span className="text-destructive">*</span></Label>
          <Select value={targetType} onValueChange={v => { setTargetType(v as "subject" | "pillar"); setTarget(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="subject">A Subject</SelectItem>
              <SelectItem value="pillar">A Pillar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{targetType === "subject" ? "Subject" : "Pillar"} <span className="text-destructive">*</span></Label>
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue placeholder={`Select ${targetType}`} /></SelectTrigger>
            <SelectContent>
              {(targetType === "subject" ? SUBJECTS : PILLARS).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>PDF File <span className="text-destructive">*</span></Label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => document.getElementById("pdf-file-input")?.click()}>
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium">{file.name}</span>
              <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
            </div>
          ) : (
            <div className="text-muted-foreground space-y-1">
              <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click to select a PDF file</p>
              <p className="text-xs">PDF only</p>
            </div>
          )}
        </div>
        <input id="pdf-file-input" type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kitab al-Tawhid" required />
        </div>
        {targetType === "subject" && (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="classical">Classical Text</SelectItem>
                <SelectItem value="contemporary">Contemporary</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Page Count <span className="text-foreground/40 text-xs">(optional)</span></Label>
          <Input type="number" value={pageCount} onChange={e => setPageCount(e.target.value)} placeholder="e.g. 120" min="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Tags <span className="text-foreground/40 text-xs">(optional — comma separated)</span></Label>
        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. tawheed, classical, Shafi'i" />
      </div>

      {(step === "uploading" || step === "saving") && (
        <UploadProgress progress={progress} label={step === "uploading" ? "Uploading file..." : "Saving..."} />
      )}
      {step === "error" && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" disabled={!file || !title || !target || step === "uploading" || step === "saving"} className="w-full">
        {step === "uploading" || step === "saving" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {step === "uploading" ? "Uploading..." : "Saving..."}</>
        ) : step === "done" ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Uploaded Successfully!</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> Upload PDF</>
        )}
      </Button>
    </form>
  );
}

// ── Video Link (for Pillars — paste URL) ─────────────────────────────────────

function VideoLinkForm() {
  const queryClient = useQueryClient();
  const [pillarId, setPillarId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pillarId || !title || !url) return;
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/admin/pillar-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pillarId, type: "video_link", title, description, url, thumbnailUrl: thumbnailUrl || undefined }),
      });
      if (!res.ok) throw new Error("Failed to save");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pillar-content"] });
      setDone(true);
      setTimeout(() => { setDone(false); setPillarId(""); setTitle(""); setDescription(""); setUrl(""); setThumbnailUrl(""); }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
        <LinkIcon className="w-4 h-4 inline mr-1.5 text-primary" />
        Use this form to add an external video link (YouTube, etc.) to a Pillar page.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Pillar <span className="text-destructive">*</span></Label>
          <Select value={pillarId} onValueChange={setPillarId}>
            <SelectTrigger><SelectValue placeholder="Select pillar" /></SelectTrigger>
            <SelectContent>
              {PILLARS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Understanding Salah" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Video URL <span className="text-destructive">*</span></Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." required />
      </div>

      <div className="space-y-2">
        <Label>Thumbnail URL <span className="text-foreground/40 text-xs">(optional)</span></Label>
        <Input value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} placeholder="https://img.youtube.com/vi/.../0.jpg" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" disabled={!pillarId || !title || !url || saving} className="w-full">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          : done ? <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</>
          : <><LinkIcon className="w-4 h-4 mr-2" /> Add Video Link</>}
      </Button>
    </form>
  );
}

// ── Reels & Shorts Upload ─────────────────────────────────────────────────────

function ReelsUploadForm() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState<"subject" | "feed" | "pillar">("subject");
  const [type, setType] = useState<"short" | "reel">("short");
  const [duration, setDuration] = useState("");
  const [progress, setProgress] = useState(0);
  const [speedBps, setSpeedBps] = useState(0);
  const [step, setStep] = useState<"idle" | "uploading" | "uploading-thumb" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function handleThumbnailChange(f: File | undefined) {
    if (!f) return;
    setThumbnailFile(f);
    setThumbnailPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    if (targetType !== "feed" && !target) return;
    setError(""); setStep("uploading"); setProgress(10); setSpeedBps(0);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl(file);
      setProgress(15);
      await uploadWithProgress(uploadURL, file, (loaded, total, speed) => {
        setSpeedBps(speed);
        setProgress(15 + Math.round((loaded / total) * 45));
      });
      setSpeedBps(0); setProgress(60);

      let thumbnailUrl: string | undefined;
      if (thumbnailFile) {
        setStep("uploading-thumb");
        const { uploadURL: tu, objectPath: tp } = await requestUploadUrl(thumbnailFile);
        await uploadWithProgress(tu, thumbnailFile, (loaded, total, speed) => {
          setSpeedBps(speed);
          setProgress(60 + Math.round((loaded / total) * 20));
        });
        thumbnailUrl = `/api/storage/objects/${tp.replace(/^\/objects\//, '')}`;
        setSpeedBps(0); setProgress(80);
      }

      setStep("saving"); setProgress(90);

      if (targetType === "pillar") {
        const videoUrl = `/api/storage/objects/${objectPath.replace(/^\/objects\//, '')}`;
        const res = await fetch("/api/admin/pillar-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pillarId: target, type: "video_link", title, description, url: videoUrl, thumbnailUrl }),
        });
        if (!res.ok) throw new Error("Failed to save reel");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/pillar-content"] });
      } else {
        const subjectId = targetType === "feed" ? "feed" : target;
        const res = await fetch("/api/admin/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, subjectId, type, duration, objectPath, thumbnailUrl }),
        });
        if (!res.ok) throw new Error("Failed to save reel");
        queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      }

      setProgress(100); setStep("done");
      setTimeout(() => {
        setStep("idle"); setProgress(0); setFile(null); setThumbnailFile(null); setThumbnailPreview(null);
        setTitle(""); setDescription(""); setTarget(""); setDuration("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("error"); setProgress(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg text-sm text-foreground/70">
        <strong className="text-foreground">Reels & Shorts</strong> are short video clips (under 10 min). Choose where it will appear: on a Subject page, the Homepage feed, or a Pillar page.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Publish to <span className="text-destructive">*</span></Label>
          <Select value={targetType} onValueChange={v => { setTargetType(v as "subject" | "feed" | "pillar"); setTarget(""); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="subject">A Subject page</SelectItem>
              <SelectItem value="feed">Homepage Feed</SelectItem>
              <SelectItem value="pillar">A Pillar page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {targetType !== "feed" && (
          <div className="space-y-2">
            <Label>{targetType === "subject" ? "Subject" : "Pillar"} <span className="text-destructive">*</span></Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger><SelectValue placeholder={`Select ${targetType === "subject" ? "subject" : "pillar"}`} /></SelectTrigger>
              <SelectContent>
                {(targetType === "subject" ? SUBJECTS : PILLARS).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {targetType === "subject" && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={v => setType(v as "short" | "reel")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Video File <span className="text-destructive">*</span></Label>
          <div className="border-2 border-dashed border-border rounded-lg p-5 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => document.getElementById("reel-file-input")?.click()}>
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <Video className="w-5 h-5 text-primary" />
                <span className="font-medium text-sm truncate max-w-[160px]">{file.name}</span>
                <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)} MB</Badge>
              </div>
            ) : (
              <div className="text-foreground/50 space-y-1">
                <Upload className="w-7 h-7 mx-auto mb-1 opacity-50" />
                <p className="text-sm">Click to select video</p>
                <p className="text-xs">MP4, MOV, WebM</p>
              </div>
            )}
          </div>
          <input id="reel-file-input" type="file" accept="video/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="space-y-2">
          <Label>Thumbnail <span className="text-foreground/40 text-xs">(optional)</span></Label>
          <div className="border-2 border-dashed border-border rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors relative" style={{ height: "116px" }} onClick={() => document.getElementById("reel-thumb-input")?.click()}>
            {thumbnailPreview ? (
              <>
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">Click to change</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-foreground/50 space-y-1">
                <Upload className="w-7 h-7 opacity-50" />
                <p className="text-sm">Add thumbnail</p>
                <p className="text-xs">JPG, PNG, WebP</p>
              </div>
            )}
          </div>
          <input id="reel-thumb-input" type="file" accept="image/*" className="hidden" onChange={e => handleThumbnailChange(e.target.files?.[0])} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title <span className="text-destructive">*</span></Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. What is Zakat?" required />
        </div>
        <div className="space-y-2">
          <Label>Duration <span className="text-foreground/40 text-xs">(optional)</span></Label>
          <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 1:30" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
      </div>

      {(step === "uploading" || step === "uploading-thumb" || step === "saving") && (
        <UploadProgress progress={progress} speedBps={speedBps} label={step === "uploading" ? "Uploading reel..." : step === "uploading-thumb" ? "Uploading thumbnail..." : "Saving..."} />
      )}
      {step === "error" && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button type="submit" disabled={(!file || !title || (targetType !== "feed" && !target)) || step === "uploading" || step === "uploading-thumb" || step === "saving"} className="w-full">
        {step === "uploading" || step === "uploading-thumb" || step === "saving" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {step === "uploading" ? "Uploading reel..." : step === "uploading-thumb" ? "Uploading thumbnail..." : "Saving..."}</>
        ) : step === "done" ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Published Successfully!</>
        ) : (
          <><Upload className="w-4 h-4 mr-2" /> Publish Reel / Short</>
        )}
      </Button>
    </form>
  );
}

// ── Quiz Builder ──────────────────────────────────────────────────────────────

const EMPTY_QUESTION = () => ({ question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" });

function QuizBuilderForm() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"create" | "questions">("create");
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [createdQuizTitle, setCreatedQuizTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [passThreshold, setPassThreshold] = useState(70);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState(EMPTY_QUESTION());
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  const { data: allQuizzes = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/quizzes"],
    queryFn: () => fetch("/api/admin/quizzes").then(r => r.json()),
  });

  const deleteQuiz = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] }),
  });

  const deleteQuestion = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/questions/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] }),
  });

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !subjectId) return;
    setCreateError(""); setCreating(true);
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, subjectId, difficulty, passThreshold }),
      });
      if (!res.ok) throw new Error("Failed to create quiz");
      const quiz = await res.json();
      setCreatedQuizId(quiz.id); setCreatedQuizTitle(quiz.title); setSavedCount(0); setStep("questions");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
    } catch (err) { setCreateError(err instanceof Error ? err.message : "Failed"); }
    finally { setCreating(false); }
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!createdQuizId || !q.question || q.options.some(o => !o.trim())) {
      setQuestionError("Please fill in the question and all 4 answer options."); return;
    }
    if (!q.explanation.trim()) { setQuestionError("Please add an explanation."); return; }
    setQuestionError(""); setAddingQuestion(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${createdQuizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: createdQuizId, question: q.question, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, sortOrder: savedCount }),
      });
      if (!res.ok) throw new Error("Failed to save question");
      setSavedCount(c => c + 1); setQ(EMPTY_QUESTION());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quizzes"] });
    } catch (err) { setQuestionError(err instanceof Error ? err.message : "Failed"); }
    finally { setAddingQuestion(false); }
  }

  function handleFinish() {
    setStep("create"); setCreatedQuizId(null); setCreatedQuizTitle(""); setTitle("");
    setDescription(""); setSubjectId(""); setDifficulty("beginner"); setPassThreshold(70); setSavedCount(0); setQ(EMPTY_QUESTION());
  }

  function handleEditExisting(quiz: any) {
    setCreatedQuizId(quiz.id);
    setCreatedQuizTitle(quiz.title);
    setSavedCount(quiz.questions?.length ?? 0);
    setQ(EMPTY_QUESTION());
    setStep("questions");
  }

  const currentQuiz = allQuizzes.find((quiz: any) => quiz.id === createdQuizId);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 text-sm">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${step === "create" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <span>1</span> Quiz Details
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${step === "questions" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <span>2</span> Add Questions
        </div>
      </div>

      {step === "create" && (
        <form onSubmit={handleCreateQuiz} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quiz Title <span className="text-destructive">*</span></Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Pillars of Iman Quiz" required />
            </div>
            <div className="space-y-2">
              <Label>Subject <span className="text-destructive">*</span></Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={v => setDifficulty(v as "beginner" | "intermediate" | "advanced")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pass Threshold <span className="text-foreground/40 text-xs">(%) — default 70%</span></Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={passThreshold}
                onChange={e => setPassThreshold(Math.max(1, Math.min(100, parseInt(e.target.value) || 70)))}
                placeholder="70"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-foreground/40 text-xs">(optional)</span></Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} />
          </div>
          {createError && <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0" /> {createError}</div>}
          <Button type="submit" disabled={!title || !subjectId || creating} className="w-full">
            {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4 mr-2" /> Create Quiz & Add Questions</>}
          </Button>
        </form>
      )}

      {step === "questions" && createdQuizId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Building quiz</p>
              <p className="font-bold text-primary">{createdQuizTitle}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{savedCount} question{savedCount !== 1 ? "s" : ""} added</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleFinish} className="border-primary/30 text-primary hover:bg-primary/5">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Done
            </Button>
          </div>

          {currentQuiz?.questions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Questions added:</p>
              {currentQuiz.questions.map((sq: any, idx: number) => (
                <div key={sq.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{idx + 1}</span>
                  <span className="flex-1">{sq.question}</span>
                  <button onClick={() => deleteQuestion.mutate(sq.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddQuestion} className="space-y-5 border border-border rounded-xl p-5 bg-card">
            <p className="font-bold text-sm">Question {savedCount + 1}</p>
            <div className="space-y-2">
              <Label>Question Text <span className="text-destructive">*</span></Label>
              <Textarea value={q.question} onChange={e => setQ(prev => ({ ...prev, question: e.target.value }))} placeholder="e.g. What are the Six Pillars of Iman?" rows={2} required />
            </div>
            <div className="space-y-3">
              <Label>Answer Options <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal">— click the circle to mark the correct answer</span></Label>
              {q.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <button type="button" onClick={() => setQ(prev => ({ ...prev, correctIndex: idx }))}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${q.correctIndex === idx ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary/50"}`}>
                    {q.correctIndex === idx ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs font-bold text-muted-foreground">{String.fromCharCode(65 + idx)}</span>}
                  </button>
                  <Input value={opt} onChange={e => { const u = [...q.options]; u[idx] = e.target.value; setQ(prev => ({ ...prev, options: u })); }} placeholder={`Option ${String.fromCharCode(65 + idx)}`} required />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Correct answer: <span className="font-medium text-primary">Option {String.fromCharCode(65 + q.correctIndex)}</span></p>
            </div>
            <div className="space-y-2">
              <Label>Explanation <span className="text-destructive">*</span></Label>
              <Textarea value={q.explanation} onChange={e => setQ(prev => ({ ...prev, explanation: e.target.value }))} placeholder="Explain why the correct answer is right..." rows={2} required />
            </div>
            {questionError && <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg"><AlertCircle className="w-4 h-4 shrink-0" /> {questionError}</div>}
            <div className="flex gap-3">
              <Button type="submit" disabled={addingQuestion} className="flex-1">
                {addingQuestion ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Plus className="w-4 h-4 mr-2" /> Save & Add Another</>}
              </Button>
              <Button type="button" variant="outline" onClick={handleFinish} className="border-primary/30 text-primary hover:bg-primary/5">
                <Check className="w-4 h-4 mr-1.5" /> Finish
              </Button>
            </div>
          </form>
        </div>
      )}

      {allQuizzes.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" /> All Quizzes ({allQuizzes.length})</h3>
          <div className="space-y-3">
            {allQuizzes.map((quiz: any) => (
              <div key={quiz.id} className="p-4 bg-card border border-border rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold truncate">{quiz.title}</p>
                      <Badge variant="secondary" className="capitalize text-xs">{quiz.subjectId}</Badge>
                      <Badge variant="outline" className="capitalize text-xs">{quiz.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quiz.questions?.length ?? 0} question{(quiz.questions?.length ?? 0) !== 1 ? "s" : ""} · Pass at {quiz.passThreshold ?? 70}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary text-xs" onClick={() => handleEditExisting(quiz)}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Qs
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteQuiz.mutate(quiz.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {quiz.questions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-1">
                    {quiz.questions.map((sq: any, idx: number) => (
                      <p key={sq.id} className="text-xs text-muted-foreground truncate"><span className="font-medium text-foreground/70">{idx + 1}.</span> {sq.question}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {allQuizzes.length === 0 && step === "create" && (
        <p className="text-muted-foreground text-sm p-4 bg-card border border-border rounded-lg text-center">No quizzes yet. Fill in the form above to create your first exam.</p>
      )}
    </div>
  );
}

// ── Q&A Inbox ─────────────────────────────────────────────────────────────────

function QAInbox() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const { data: questions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/questions"],
    queryFn: () => fetch("/api/admin/questions").then(r => r.json()),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/questions/${id}/read`, { method: "PATCH" }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] }),
  });

  const deleteQ = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/questions/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/questions"] }),
  });

  const unreadCount = questions.filter((q: any) => !q.isRead).length;
  const displayed = filter === "unread" ? questions.filter((q: any) => !q.isRead) : questions;

  const contextLabel = (q: any) => {
    const type = q.contextType === "pillar" ? "Pillar" : "Subject";
    const id = q.contextId.charAt(0).toUpperCase() + q.contextId.slice(1);
    return `${type}: ${id}`;
  };

  if (isLoading) return <div className="text-muted-foreground text-sm p-8 text-center">Loading questions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === "unread" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              Unread {unreadCount > 0 && <Badge className="ml-1 bg-accent text-accent-foreground text-[10px] h-4 px-1">{unreadCount}</Badge>}
            </button>
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              All ({questions.length})
            </button>
          </div>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{filter === "unread" ? "No unread questions" : "No questions yet"}</p>
          <p className="text-sm mt-1">{filter === "unread" ? "All questions have been reviewed." : "Questions submitted by students will appear here."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...displayed].reverse().map((q: any) => (
            <div key={q.id} className={`p-5 rounded-xl border transition-colors ${q.isRead ? "bg-card border-border" : "bg-primary/3 border-primary/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-sm">{q.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">{contextLabel(q)}</Badge>
                    {!q.isRead && <Badge className="text-[10px] h-4 px-1.5 bg-accent text-accent-foreground">New</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(q.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">{q.question}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                {!q.isRead && (
                  <Button variant="outline" size="sm" onClick={() => markRead.mutate(q.id)} className="text-xs border-primary/30 text-primary hover:bg-primary/5">
                    <Check className="w-3 h-3 mr-1" /> Mark as read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteQ.mutate(q.id)} className="text-xs text-destructive hover:text-destructive ml-auto">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content Library ───────────────────────────────────────────────────────────

function ContentLibrary() {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string; kind: "video" | "pdf" | "pillar" } | null>(null);

  const { data: videos = [] } = useQuery<any[]>({ queryKey: ["/api/admin/videos"], queryFn: () => fetch("/api/admin/videos").then(r => r.json()) });
  const { data: pdfs = [] } = useQuery<any[]>({ queryKey: ["/api/admin/pdfs"], queryFn: () => fetch("/api/admin/pdfs").then(r => r.json()) });
  const { data: pillarContent = [] } = useQuery<any[]>({ queryKey: ["/api/admin/pillar-content"], queryFn: () => fetch("/api/admin/pillar-content").then(r => r.json()) });

  const deleteVideo = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/videos/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] }); setConfirmDelete(null); },
  });
  const deletePdf = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/pdfs/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/pdfs"] }); setConfirmDelete(null); },
  });
  const deletePillarItem = useMutation({
    mutationFn: (id: string) => fetch(`/api/admin/pillar-content/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/pillar-content"] }); setConfirmDelete(null); },
  });

  function handleConfirmedDelete() {
    if (!confirmDelete) return;
    if (confirmDelete.kind === "video") deleteVideo.mutate(confirmDelete.id);
    else if (confirmDelete.kind === "pdf") deletePdf.mutate(confirmDelete.id);
    else deletePillarItem.mutate(confirmDelete.id);
  }

  const isDeleting = deleteVideo.isPending || deletePdf.isPending || deletePillarItem.isPending;

  const Section = ({ icon: Icon, title, items, kind, renderMeta }: any) => (
    <div>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Icon className="w-5 h-5 text-primary" /> {title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm p-4 bg-card border border-border rounded-lg">Nothing here yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">{renderMeta(item)}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => setConfirmDelete({ id: item.id, title: item.title, kind })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={open => { if (!open) setConfirmDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-lg font-bold">Delete this item?</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            You are about to permanently delete <span className="font-semibold text-foreground">"{confirmDelete?.title}"</span>. This cannot be undone.
          </p>
          <div className="flex gap-3 mt-4 justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmedDelete} disabled={isDeleting} className="gap-2">
              {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Yes, delete</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-10">
        <Section icon={Video} title="Subject Videos" kind="video" items={videos} renderMeta={(v: any) => (
          <>
            <Badge variant="secondary" className="capitalize text-xs">{v.subjectId === "feed" ? "Feed" : v.subjectId}</Badge>
            <Badge variant="outline" className="capitalize text-xs">{v.type}</Badge>
            {v.duration && <span className="text-xs text-muted-foreground">{v.duration}</span>}
            <span className="text-xs text-muted-foreground flex items-center gap-1">👁 {v.viewCount ?? 0} views</span>
          </>
        )} />
        <Section icon={FileText} title="Subject PDFs" kind="pdf" items={pdfs} renderMeta={(p: any) => (
          <>
            <Badge variant="secondary" className="capitalize text-xs">{p.subjectId}</Badge>
            <Badge variant="outline" className="capitalize text-xs">{p.category}</Badge>
            {p.pageCount > 0 && <span className="text-xs text-muted-foreground">{p.pageCount} pages</span>}
          </>
        )} />
        <Section icon={LinkIcon} title="Pillar Content" kind="pillar" items={pillarContent} renderMeta={(c: any) => (
          <>
            <Badge variant="secondary" className="capitalize text-xs">{c.pillarId}</Badge>
            <Badge variant="outline" className="capitalize text-xs">{c.type === "video_link" ? "Video Link" : "PDF"}</Badge>
          </>
        )} />
      </div>
    </>
  );
}

// ── Announcements Panel ───────────────────────────────────────────────────────

function AnnouncementsPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState("");
  const [loaded, setLoaded] = useState(false);

  useQuery({
    queryKey: ["/api/announcement"],
    queryFn: () => fetch("/api/announcement").then(r => r.json()).then(d => {
      setCurrent(d.message ?? "");
      if (!loaded) { setMessage(d.message ?? ""); setLoaded(true); }
      return d;
    }),
  });

  const save = useMutation({
    mutationFn: (msg: string) =>
      fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      }).then(r => r.json()),
    onSuccess: (data) => {
      setCurrent(data.message ?? "");
      queryClient.invalidateQueries({ queryKey: ["/api/announcement"] });
    },
  });

  const isSaving = save.isPending;

  return (
    <div className="space-y-6 max-w-2xl">
      {current && (
        <div className="flex items-start gap-3 p-4 bg-accent/10 border border-accent/30 rounded-xl">
          <Megaphone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-accent mb-1">Currently live on site:</p>
            <p className="text-sm break-words">{current}</p>
          </div>
          <button
            onClick={() => { setMessage(""); save.mutate(""); }}
            className="w-6 h-6 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors shrink-0"
            title="Clear announcement"
          >
            <X className="w-3.5 h-3.5 text-accent" />
          </button>
        </div>
      )}
      {!current && loaded && (
        <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground">
          No announcement is currently showing. Type a message below and click Publish.
        </div>
      )}
      <div className="space-y-3">
        <Label htmlFor="announcement-msg">Announcement message</Label>
        <Textarea
          id="announcement-msg"
          placeholder="e.g. New Aqidah lessons have been uploaded — check the Subjects page!"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex gap-3">
          <Button
            onClick={() => save.mutate(message)}
            disabled={isSaving || !message.trim()}
            className="gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            {current ? "Update Announcement" : "Publish Announcement"}
          </Button>
          {current && (
            <Button
              variant="outline"
              onClick={() => { setMessage(""); save.mutate(""); }}
              disabled={isSaving}
              className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-2"
            >
              <X className="w-4 h-4" /> Clear &amp; Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function Admin() {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const { data: questions = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/questions"],
    queryFn: () => fetch("/api/admin/questions").then(r => r.json()),
    enabled: isAuthenticated,
  });
  const unreadCount = questions.filter((q: any) => !q.isRead).length;

  if (!isAuthenticated) return <AdminLogin onLogin={login} />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Content Management</h1>
            <p className="text-foreground/60 text-lg">Upload content, build quizzes, and manage student questions.</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <a href="/user-manual.html" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-2 text-primary border-primary/30 hover:bg-primary/5">
                <BookMarked className="w-3.5 h-3.5" /> User Manual
              </Button>
            </a>
            <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 text-foreground/60">
              <Lock className="w-3.5 h-3.5" /> Lock
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upload-video">
          <TabsList className="bg-card border border-border w-full justify-start p-1 h-auto mb-8 flex-wrap gap-1">
            <TabsTrigger value="upload-video" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4 mr-2" /> Upload Video
            </TabsTrigger>
            <TabsTrigger value="upload-pdf" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" /> Upload PDF
            </TabsTrigger>
            <TabsTrigger value="video-link" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LinkIcon className="w-4 h-4 mr-2" /> Video Link
            </TabsTrigger>
            <TabsTrigger value="quiz-builder" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <GraduationCap className="w-4 h-4 mr-2" /> Quiz Builder
            </TabsTrigger>
            <TabsTrigger value="qa-inbox" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
              <MessageSquare className="w-4 h-4 mr-2" /> Q&amp;A Inbox
              {unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="library" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle className="w-4 h-4 mr-2" /> Content Library
            </TabsTrigger>
            <TabsTrigger value="reels" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4 mr-2" /> Reels & Shorts
            </TabsTrigger>
            <TabsTrigger value="announcements" className="py-2.5 px-4 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Megaphone className="w-4 h-4 mr-2" /> Announcement
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload-video">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Upload a Video</CardTitle>
                <p className="text-muted-foreground text-sm">Upload a video file to a Subject or a Pillar page.</p>
              </CardHeader>
              <CardContent><VideoUploadForm /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload-pdf">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Upload a PDF / Book</CardTitle>
                <p className="text-muted-foreground text-sm">Upload a PDF file to a Subject or a Pillar page.</p>
              </CardHeader>
              <CardContent><PdfUploadForm /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-link">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Add a Video Link</CardTitle>
                <p className="text-muted-foreground text-sm">Paste an external video URL (YouTube, etc.) to display on a Pillar page.</p>
              </CardHeader>
              <CardContent><VideoLinkForm /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz-builder">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Quiz Builder</CardTitle>
                <p className="text-muted-foreground text-sm">Create exams with multiple-choice questions for any subject.</p>
              </CardHeader>
              <CardContent><QuizBuilderForm /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qa-inbox">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  Q&amp;A Inbox
                  {unreadCount > 0 && <Badge className="bg-accent text-accent-foreground">{unreadCount} new</Badge>}
                </CardTitle>
                <p className="text-muted-foreground text-sm">Questions submitted by students from any Subject or Pillar page.</p>
              </CardHeader>
              <CardContent><QAInbox /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Content Library</CardTitle>
              </CardHeader>
              <CardContent><ContentLibrary /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reels">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Upload a Reel or Short</CardTitle>
                <p className="text-muted-foreground text-sm">Upload a short video to a Subject, the Homepage feed, or a Pillar page.</p>
              </CardHeader>
              <CardContent><ReelsUploadForm /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif text-2xl flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-accent" /> Announcements
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Post a notice that appears in a gold banner at the top of your website for all visitors. Clear it when done.
                </p>
              </CardHeader>
              <CardContent><AnnouncementsPanel /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
