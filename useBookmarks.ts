import { useState, useEffect, useCallback } from "react";

export type BookmarkItem = {
  id: string;
  type: "video" | "pdf" | "link";
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  contextName: string;
  contextId: string;
  contextType: "subject" | "pillar";
  savedAt: number;
};

const STORAGE_KEY = "al-mishkat-bookmarks";

function load(): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: BookmarkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(load);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggle = useCallback((item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      const next = exists ? prev.filter((b) => b.id !== item.id) : [item, ...prev];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    save([]);
    setBookmarks([]);
  }, []);

  return { bookmarks, isBookmarked, toggle, remove, clearAll };
}

export function useBookmarkItem(id: string) {
  const [saved, setSaved] = useState(() => load().some((b) => b.id === id));

  const toggle = useCallback(
    (item: BookmarkItem) => {
      const prev = load();
      const exists = prev.some((b) => b.id === id);
      const next = exists ? prev.filter((b) => b.id !== id) : [item, ...prev];
      save(next);
      setSaved(!exists);
    },
    [id]
  );

  return { saved, toggle };
}
