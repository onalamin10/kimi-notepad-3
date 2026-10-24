import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ListView } from "./components/ListView";
import { EditorView } from "./components/EditorView";
import { SettingsView } from "./components/SettingsView";
import { TrashView } from "./components/TrashView";
import { useNotes, useSettings, filterNotes } from "./hooks/useNotes";
import { blocksToText } from "./utils/helpers";
import { TemplatePicker } from "./components/TemplatePicker";
import { LockScreen } from "./components/LockScreen";
import type { Folder, Note, Block, NoteMode } from "./types";

export default function App() {
  const {
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
  } = useNotes();
  const { settings, patchSettings } = useSettings();

  const [view, setView] = useState<"list" | "editor" | "settings" | "trash">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<"all" | "private" | Folder>("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [lockScreen, setLockScreen] = useState<{
    open: boolean;
    mode: "unlock" | "create" | "change";
    noteId: string | null;
  }>({ open: false, mode: "unlock", noteId: null });

  const effectiveDark = useMemo(() => {
    if (settings.darkMode === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return settings.darkMode === "dark";
  }, [settings.darkMode]);

  useEffect(() => {
    if (effectiveDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [effectiveDark]);

  const filteredNotes = useMemo(
    () => filterNotes(notes, folderFilter, searchQuery, false),
    [notes, folderFilter, searchQuery]
  );

  const deletedNotes = useMemo(
    () => filterNotes(notes, "all", searchQuery, true),
    [notes, searchQuery]
  );

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  function handleCreate() {
    setShowTemplates(true);
  }

  function handleCreateWithTemplate(mode: NoteMode, content: string, blocks: Block[]) {
    const folder: Folder = folderFilter === "all" || folderFilter === "private" ? "note" : folderFilter;
    const note = createNote(folder, mode === "blocks" ? blocks : undefined);
    if (mode === "simple") {
      updateNote(note.id, { content, mode: "simple", blocks: [] });
    } else {
      updateNote(note.id, { mode: "blocks", content: "", blocks });
    }
    setSelectedId(note.id);
    setView("editor");
    setShowTemplates(false);
  }

  function handleSelect(id: string) {
    const note = notes.find((n) => n.id === id);
    if (note?.isPrivate && !unlockedIds.has(id)) {
      setLockScreen({ open: true, mode: "unlock", noteId: id });
      return;
    }
    setSelectedId(id);
    setView("editor");
  }

  function handleUnlock() {
    const id = lockScreen.noteId;
    if (!id) return;
    setUnlockedIds((prev) => new Set(prev).add(id));
    setLockScreen({ open: false, mode: "unlock", noteId: null });
    setSelectedId(id);
    setView("editor");
  }

  function handleSetPin(pinHash: string) {
    const id = lockScreen.noteId;
    if (!id) return;
    setPin(id, pinHash);
    setPrivate(id, true);
    setUnlockedIds((prev) => new Set(prev).add(id));
    setLockScreen({ open: false, mode: "unlock", noteId: null });
  }

  function handleTogglePrivate(note: Note) {
    if (note.isPrivate) {
      // remove lock
      setPrivate(note.id, false);
      setPin(note.id, null);
      setUnlockedIds((prev) => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
    } else {
      setLockScreen({ open: true, mode: "create", noteId: note.id });
    }
  }

  function handleChangePin(note: Note) {
    setLockScreen({ open: true, mode: "change", noteId: note.id });
  }

  function handleBack() {
    setSelectedId(null);
    setView("list");
  }

  function handleDelete(id: string) {
    moveToTrash(id);
    if (selectedId === id) {
      setSelectedId(null);
      setView("list");
    }
  }

  function handleShare(note: Note) {
    const body = note.mode === "simple" ? note.content : blocksToText(note.blocks);
    const text = note.title ? `${note.title}\n\n${body}` : body;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function handleExport() {
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleUpdateBlocks(blocks: Block[]) {
    if (selectedNote) updateBlocks(selectedNote.id, blocks);
  }

  return (
    <div className="flex h-full justify-center bg-[#F2F2F7] text-[#1C1C1E] dark:bg-[#000000] dark:text-white">
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden bg-[#F2F2F7] shadow-2xl dark:bg-[#1C1C1E]">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <ListView
              key="list"
              notes={filteredNotes}
              totalCount={filterNotes(notes, "all", "", false).length}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              folderFilter={folderFilter}
              setFolderFilter={setFolderFilter}
              view={settings.view}
              setView={(v) => patchSettings({ view: v })}
              onCreate={handleCreate}
              onSelect={handleSelect}
              onDelete={handleDelete}
              onTogglePin={togglePin}
              onOpenSettings={() => setView("settings")}
            />
          )}
          {view === "editor" && (
            <EditorView
              key="editor"
              note={selectedNote}
              onBack={handleBack}
              onUpdate={(patch) =>
                selectedNote && updateNote(selectedNote.id, patch)
              }
              onUpdateBlocks={handleUpdateBlocks}
              onDelete={() => selectedNote && handleDelete(selectedNote.id)}
              onShare={() => selectedNote && handleShare(selectedNote)}
              onTogglePin={() => selectedNote && togglePin(selectedNote.id)}
              onTogglePrivate={() =>
                selectedNote && handleTogglePrivate(selectedNote)
              }
              onChangePin={() =>
                selectedNote && handleChangePin(selectedNote)
              }
              isUnlocked={
                selectedNote ? unlockedIds.has(selectedNote.id) : false
              }
            />
          )}
          {view === "settings" && (
            <SettingsView
              key="settings"
              settings={settings}
              onPatchSettings={patchSettings}
              onBack={() => setView("list")}
              onOpenTrash={() => setView("trash")}
              onExport={handleExport}
              trashCount={deletedNotes.length}
            />
          )}
          {view === "trash" && (
            <TrashView
              key="trash"
              notes={deletedNotes}
              onBack={() => setView("settings")}
              onRestore={restoreNote}
              onDeleteForever={deleteForever}
              onSelect={(id: string) => {
                setSelectedId(id);
                setView("editor");
              }}
            />
          )}
        </AnimatePresence>

        <TemplatePicker
          open={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelect={(mode, content, blocks) =>
            handleCreateWithTemplate(mode, content, blocks)
          }
        />

        {lockScreen.open && lockScreen.noteId && (
          <LockScreen
            mode={lockScreen.mode}
            title={notes.find((n) => n.id === lockScreen.noteId)?.title}
            pinHash={
              notes.find((n) => n.id === lockScreen.noteId)?.pinHash ?? null
            }
            onUnlock={handleUnlock}
            onSetPin={handleSetPin}
            onCancel={() =>
              setLockScreen({ open: false, mode: "unlock", noteId: null })
            }
          />
        )}
      </div>
    </div>
  );
}
