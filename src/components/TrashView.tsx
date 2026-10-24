import { motion } from "framer-motion";
import { ChevronLeft, RotateCcw, Trash2, FileText } from "lucide-react";
import type { Note } from "../types";
import { formatNoteDate, getNotePlainText } from "../utils/helpers";

interface TrashViewProps {
  notes: Note[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
  onSelect: (id: string) => void;
}

export function TrashView({
  notes,
  onBack,
  onRestore,
  onDeleteForever,
  onSelect,
}: TrashViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-full flex-col bg-[#F2F2F7] dark:bg-[#000000]"
    >
      <header className="safe-top ios-glass flex items-center border-b border-[#E5E5EA] px-4 pb-3 pt-5 dark:border-[#38383A]">
        <button
          onClick={onBack}
          className="flex items-center gap-0.5 text-[#007AFF] active:opacity-60"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="text-[17px] font-semibold">Settings</span>
        </button>
        <h1 className="ml-3 text-[20px] font-bold text-[#1C1C1E] dark:text-white">
          Trash
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="ios-button mb-5 flex h-20 w-20 items-center justify-center">
              <Trash2 className="h-10 w-10 text-[#C7C7CC]" />
            </div>
            <h3 className="text-[20px] font-semibold text-[#1C1C1E] dark:text-white">
              Trash is empty
            </h3>
            <p className="mt-1 max-w-[220px] text-[15px] leading-relaxed text-[#8E8E93]">
              Deleted notes will appear here until restored or removed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelect(note.id)}
                className="ios-card cursor-pointer p-4 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[17px] font-semibold text-[#1C1C1E] dark:text-white">
                      {note.title || "Untitled"}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-[#8E8E93]">
                      {getNotePlainText(note).trim() || "No additional text"}
                    </p>
                    <p className="mt-2 text-[12px] text-[#C7C7CC]">
                      Deleted {formatNoteDate(note.deletedAt ?? Date.now())}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-[#C7C7CC]" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(note.id);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#34C759]/10 py-2 text-[12px] font-semibold text-[#34C759] active:bg-[#34C759]/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteForever(note.id);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-[#FF3B30]/10 py-2 text-[12px] font-semibold text-[#FF3B30] active:bg-[#FF3B30]/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
