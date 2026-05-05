import { useState, useCallback } from "react";

export type NoteEntry = {
  text: string;
  updatedAt: number;
};

type NotesStore = Record<string, NoteEntry>;

const STORAGE_KEY = "al-mishkat-notes";

function load(): NotesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(store: NotesStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useNote(itemId: string) {
  const [notes, setNotes] = useState<NotesStore>(load);

  const text = notes[itemId]?.text ?? "";

  const saveNote = useCallback(
    (newText: string) => {
      setNotes(prev => {
        const next = { ...prev };
        if (newText.trim()) {
          next[itemId] = { text: newText, updatedAt: Date.now() };
        } else {
          delete next[itemId];
        }
        save(next);
        return next;
      });
    },
    [itemId]
  );

  return { text, saveNote, hasNote: !!notes[itemId]?.text };
}

export function useAllNotes() {
  const [notes] = useState<NotesStore>(load);
  return notes;
}
