import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  FileText,
  MoreHorizontal,
  Pin,
  Trash2,
  CheckSquare,
  Lock,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { Note } from "../types";
import {
  formatNoteDate,
  getTodoStats,
  TAG_COLORS,
  getWordCount,
  getNotePlainText,
} from "../utils/helpers";

interface NoteCardProps {
  note: Note;
  view?: "grid" | "list";
  onClick: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export function NoteCard({
  note,
  onClick,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { total, completed } = getTodoStats(note);
  const preview = note.isPrivate
    ? "Locked note"
    : getNotePlainText(note).replace(/\n/g, " ").trim();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "ios-card group relative cursor-pointer overflow-hidden p-4 transition-all active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[17px] font-semibold text-[#1C1C1E] dark:text-white">
              {note.title || "Untitled"}
            </h3>
            {note.isPrivate && (
              <Lock className="h-3.5 w-3.5 text-[#8E8E93]" />
            )}
            {note.pinned && (
              <Pin className="h-3.5 w-3.5 fill-[#FF9500] text-[#FF9500]" />
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[15px] leading-relaxed text-[#8E8E93]">
            {preview || "No additional text"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] font-medium text-[#C7C7CC]">
            <span className="flex items-center gap-1">
              {note.folder === "plan" ? (
                <CalendarDays className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              {note.folder === "plan" ? "Plan" : "Note"}
            </span>
            <span>{formatNoteDate(note.updatedAt)}</span>
            {total > 0 && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  completed === total && "text-[#34C759]"
                )}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                {completed}/{total}
              </span>
            )}
            {note.tags.length > 0 && (
              <span className="flex items-center gap-1">
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: TAG_COLORS[tag] }}
                  />
                ))}
              </span>
            )}
            <span>{getWordCount(note)} words</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions((s) => !s);
          }}
          className="rounded-full p-1.5 text-[#C7C7CC] active:bg-[#F2F2F7] dark:active:bg-[#3A3A3C]"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 border-t border-[#F2F2F7] pt-3 dark:border-[#38383A]"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#F2F2F7] py-2 text-[12px] font-semibold text-[#8E8E93] active:bg-[#E5E5EA] dark:bg-[#3A3A3C]"
            >
              <Pin
                className={cn(
                  "h-3.5 w-3.5",
                  note.pinned && "fill-[#FF9500] text-[#FF9500]"
                )}
              />
              {note.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FF3B30]/10 py-2 text-[12px] font-semibold text-[#FF3B30] active:bg-[#FF3B30]/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
