import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Settings,
  X,
  LayoutGrid,
  List,
  Lock,
} from "lucide-react";
import { cn } from "../utils/cn";
import { EmptyState } from "./EmptyState";
import { NoteCard } from "./NoteCard";
import type { Folder, Note } from "../types";

interface ListViewProps {
  notes: Note[];
  totalCount: number;
  folderFilter: "all" | "private" | Folder;
  setFolderFilter: (f: "all" | "private" | Folder) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenSettings: () => void;
}

export function ListView({
  notes,
  totalCount,
  folderFilter,
  setFolderFilter,
  searchQuery,
  setSearchQuery,
  view,
  setView,
  onCreate,
  onSelect,
  onDelete,
  onTogglePin,
  onOpenSettings,
}: ListViewProps) {
  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-full flex-col bg-[#F2F2F7] dark:bg-[#000000]"
    >
      <header className="safe-top px-5 pb-3 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[40px] font-bold tracking-[-1px] text-[#1C1C1E] dark:text-white">
              Notes
            </h1>
            <p className="text-[15px] font-medium text-[#8E8E93]">
              {totalCount} notes
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSettings}
              className="ios-button flex h-10 w-10 items-center justify-center text-[#007AFF] transition-transform active:scale-95 dark:bg-[#2C2C2E]"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={onCreate}
              className="flex h-10 items-center gap-1 rounded-[14px] bg-[#007AFF] px-4 text-[15px] font-semibold text-white shadow-sm transition-transform active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              New
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 pb-3">
        <div className="ios-glass ios-button flex items-center gap-2.5 px-3 py-2.5 dark:bg-[#2C2C2E]/80">
          <Search className="h-4 w-4 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-[17px] text-[#1C1C1E] placeholder:text-[#8E8E93] dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-full bg-[#E5E5EA] p-0.5 dark:bg-[#3A3A3C]"
            >
              <X className="h-3.5 w-3.5 text-[#8E8E93]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex rounded-lg bg-[#E5E5EA] p-1 dark:bg-[#2C2C2E]">
            {(
              [
                { key: "all", label: "All", Icon: undefined as undefined },
                { key: "note", label: "Notes", Icon: undefined as undefined },
                { key: "plan", label: "Plans", Icon: undefined as undefined },
                { key: "private", label: "Private", Icon: Lock },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setFolderFilter(key)}
                className={cn(
                  "relative flex items-center gap-1 rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  folderFilter === key
                    ? "text-[#1C1C1E] dark:text-white"
                    : "text-[#8E8E93]"
                )}
              >
                {folderFilter === key && (
                  <motion.div
                    layoutId="segment-pill"
                    className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-[#3A3A3C]"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1 capitalize">
                  {Icon && <Icon className="h-3 w-3" />}
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-[#E5E5EA] p-1 dark:bg-[#2C2C2E]">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "grid"
                  ? "bg-white text-[#007AFF] shadow-sm dark:bg-[#3A3A3C]"
                  : "text-[#8E8E93]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === "list"
                  ? "bg-white text-[#007AFF] shadow-sm dark:bg-[#3A3A3C]"
                  : "text-[#8E8E93]"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 no-scrollbar">
        {notes.length === 0 ? (
          <EmptyState folder={folderFilter} onCreate={onCreate} />
        ) : (
          <div className="space-y-6">
            {pinned.length > 0 && (
              <section>
                <h2 className="mb-2.5 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
                  Pinned
                </h2>
                <NoteGrid
                  notes={pinned}
                  view={view}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              </section>
            )}
            {others.length > 0 && (
              <section>
                {pinned.length > 0 && (
                  <h2 className="mb-2.5 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
                    Others
                  </h2>
                )}
                <NoteGrid
                  notes={others}
                  view={view}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                />
              </section>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onCreate}
        className="absolute bottom-8 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-lg shadow-blue-300/40 transition-transform active:scale-90"
        aria-label="New note"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

function NoteGrid({
  notes,
  view,
  onSelect,
  onDelete,
  onTogglePin,
}: {
  notes: Note[];
  view: "grid" | "list";
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        view === "grid" ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          view={view}
          onClick={() => onSelect(note.id)}
          onDelete={() => onDelete(note.id)}
          onTogglePin={() => onTogglePin(note.id)}
        />
      ))}
    </div>
  );
}
