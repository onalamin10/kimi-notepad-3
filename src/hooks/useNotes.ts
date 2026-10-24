import { useEffect, useState } from "react";
import type { Folder, Note, AppSettings, Block } from "../types";
import { generateId, migrateNote, createBlock } from "../utils/helpers";

const STORAGE_KEY = "minimal-notes-v2";
const SETTINGS_KEY = "minimal-notes-settings-v2";

function getSeedNotes(): Note[] {
  return [
    {
      id: generateId(),
      title: "Welcome",
      content: "",
      blocks: [
        createBlock("text", "This is a minimal, Apple-style notes app."),
        createBlock("text", ""),
        createBlock("heading", "Tips"),
        createBlock("todo", "Tap the block button to use blocks", false),
        createBlock("bullet", "Everything saves automatically"),
      ],
      mode: "blocks",
      folder: "note",
      pinned: true,
      tags: ["Ideas"],
      deletedAt: null,
      isPrivate: false,
      pinHash: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: generateId(),
      title: "Simple shopping list",
      content: "• Milk\n• Eggs\n• Bread\n• Coffee",
      blocks: [],
      mode: "simple",
      folder: "plan",
      pinned: false,
      tags: ["Personal"],
      deletedAt: null,
      isPrivate: false,
      pinHash: null,
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
  ];
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setNotes(raw ? migrateNotes(JSON.parse(raw)) : getSeedNotes());
    } catch {
      setNotes([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  function createNote(folder: Folder, blocks?: Block[]): Note {
    const newNote: Note = {
      id: generateId(),
      title: "",
      content: "",
      blocks: blocks ?? [],
      mode: blocks ? "blocks" : "simple",
      folder,
      pinned: false,
      tags: [],
      deletedAt: null,
      isPrivate: false,
      pinHash: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }

  function updateNote(id: string, patch: Partial<Note>) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  }

  function updateBlocks(id: string, blocks: Block[]) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, blocks, updatedAt: Date.now() } : n
      )
    );
  }

  function moveToTrash(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, deletedAt: Date.now() } : n))
    );
  }

  function restoreNote(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, deletedAt: null } : n))
    );
  }

  function deleteForever(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function togglePin(id: string) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  }

  function setPrivate(id: string, isPrivate: boolean) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, isPrivate, pinHash: isPrivate ? n.pinHash : null }
          : n
      )
    );
  }

  function setPin(id: string, pinHash: string | null) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinHash } : n))
    );
  }

  return {
    notes,
    createNote,
    updateNote,
    updateBlocks,
    moveToTrash,
    restoreNote,
    deleteForever,
    togglePin,
    setPrivate,
    setPin,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: "system",
    view: "grid",
    sortBy: "updated",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings(JSON.parse(raw));
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  function patchSettings(patch: Partial<AppSettings>) {
    setSettings((s) => ({ ...s, ...patch }));
  }

  return { settings, patchSettings };
}

export function migrateNotes(parsed: unknown[]): Note[] {
  return parsed.map((n: any) => migrateNote(n));
}

export function filterNotes(
  notes: Note[],
  folderFilter: "all" | "private" | Folder,
  searchQuery: string,
  includeDeleted = false
) {
  let list = notes;
  if (includeDeleted) {
    list = list.filter((n) => n.deletedAt !== null);
  } else {
    list = list.filter((n) => n.deletedAt === null);
  }
  if (folderFilter === "private") {
    list = list.filter((n) => n.isPrivate);
  } else if (folderFilter !== "all") {
    list = list.filter((n) => n.folder === folderFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.blocks.some((b) => b.content.toLowerCase().includes(q)) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return list.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (folderFilter === "all") {
      return b.updatedAt - a.updatedAt;
    }
    return b.updatedAt - a.updatedAt;
  });
}

export { createBlock, TAG_COLORS } from "../utils/helpers";
