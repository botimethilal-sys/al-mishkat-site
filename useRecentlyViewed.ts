import { useState, useCallback } from "react";

export interface RecentSubject {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  color?: string;
  videoCount: number;
  pdfCount: number;
  visitedAt: string;
}

const STORAGE_KEY = "al_mishkat_recently_viewed";
const MAX_ITEMS = 4;

function loadFromStorage(): RecentSubject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentSubject[];
  } catch {
    return [];
  }
}

function saveToStorage(items: RecentSubject[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentSubject[]>(loadFromStorage);

  const trackVisit = useCallback((subject: Omit<RecentSubject, "visitedAt">) => {
    setRecentlyViewed((prev) => {
      const without = prev.filter((s) => s.id !== subject.id);
      const updated = [
        { ...subject, visitedAt: new Date().toISOString() },
        ...without,
      ].slice(0, MAX_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return { recentlyViewed, trackVisit, clearHistory };
}
