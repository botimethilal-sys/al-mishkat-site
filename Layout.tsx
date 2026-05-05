import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBanner } from "@/components/shared/AnnouncementBanner";
import { FloatingActions } from "@/components/shared/FloatingActions";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto">
        {children}
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
