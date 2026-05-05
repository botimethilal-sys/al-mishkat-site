import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, BookOpen, Settings, Sun, Moon, Bookmark, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdminAuthStatus } from "@/hooks/useAdminAuthStatus";
import { useTheme } from "@/hooks/useTheme";
import { useBookmarks } from "@/hooks/useBookmarks";

export function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = useAdminAuthStatus();
  const { isDark, toggle } = useTheme();
  const { bookmarks } = useBookmarks();
  const savedCount = bookmarks.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        Home
      </Link>
      <Link href="/subjects" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        Subjects
      </Link>
      <Link href="/pillars" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        5 Pillars
      </Link>
      <Link href="/library" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
        <Library className="w-3.5 h-3.5" /> Library
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg leading-tight text-primary">Al-Mishkat</span>
              <span className="font-serif text-xs leading-none text-muted-foreground" dir="rtl">المشكاة</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href="/admin" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border border-border rounded-md px-3 py-1.5 hover:border-primary/50">
              <Settings className="w-3.5 h-3.5" /> Admin
            </Link>
          )}

          <div className="hidden md:block w-full max-w-sm">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources..."
                className="w-full bg-card pl-9 pr-4 rounded-full border-border/50 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-global-search"
              />
            </form>
          </div>

          {/* Saved bookmarks link */}
          <Link
            href="/saved"
            className="hidden md:flex relative w-9 h-9 rounded-full items-center justify-center border border-border text-muted-foreground hover:text-accent hover:border-accent/50 transition-colors bg-card"
            aria-label="My saved items"
            title="My saved items"
          >
            <Bookmark className={`w-4 h-4 ${savedCount > 0 ? "fill-accent text-accent" : ""}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                {savedCount > 9 ? "9+" : savedCount}
              </span>
            )}
          </Link>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors bg-card"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6 pt-12">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="w-full bg-card pl-9 pr-4 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-mobile-search"
                />
              </form>
              <nav className="flex flex-col gap-4">
                <NavLinks />
                <Link href="/saved" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Bookmark className={`w-4 h-4 ${savedCount > 0 ? "fill-accent text-accent" : ""}`} />
                  My Saved {savedCount > 0 && <span className="text-xs bg-accent text-accent-foreground rounded-full px-1.5 py-0.5 font-bold">{savedCount}</span>}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Settings className="w-4 h-4" /> Admin / Upload
                  </Link>
                )}
                <button
                  onClick={() => { toggle(); setIsOpen(false); }}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors text-left"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
