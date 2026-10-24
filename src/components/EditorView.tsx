import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CalendarDays,
  FileText,
  Pin,
  Share2,
  Trash2,
  Tag,
  Info,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  Layers,
  Type,
} from "lucide-react";
import { cn } from "../utils/cn";
import {
  formatNoteDate,
  getWordCount,
  getReadingTime,
  TAG_COLORS,
  blocksToText,
  textToBlocks,
  createBlock,
} from "../utils/helpers";
import type { Note, Tag as TagType, Block, NoteMode } from "../types";
import { BlockEditor } from "./BlockEditor";

interface EditorViewProps {
  note: Note | null;
  onBack: () => void;
  onUpdate: (patch: Partial<Note>) => void;
  onUpdateBlocks: (blocks: Block[]) => void;
  onDelete: () => void;
  onShare: () => void;
  onTogglePin: () => void;
  onTogglePrivate: () => void;
  onChangePin: () => void;
  isUnlocked: boolean;
}

export function EditorView({
  note,
  onBack,
  onUpdate,
  onUpdateBlocks,
  onDelete,
  onShare,
  onTogglePin,
  onTogglePrivate,
  onChangePin,
  isUnlocked,
}: EditorViewProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (note && !note.title && !getNoteBodyText(note).trim() && !note.isPrivate) {
      titleRef.current?.focus();
    }
  }, [note?.id]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta || !note || note.mode !== "simple") return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [note?.content, note?.mode]);

  function toggleTag(tag: TagType) {
    if (!note) return;
    const next = note.tags.includes(tag)
      ? note.tags.filter((t) => t !== tag)
      : [...note.tags, tag];
    onUpdate({ tags: next });
  }

  function addBlockAtEnd(type: Block["type"] = "text") {
    if (!note) return;
    onUpdateBlocks([...note.blocks, createBlock(type)]);
  }

  function switchMode(mode: NoteMode) {
    if (!note || mode === note.mode) return;
    if (mode === "blocks") {
      const blocks = textToBlocks(note.content);
      onUpdate({ mode, blocks, content: "" });
    } else {
      const content = blocksToText(note.blocks);
      onUpdate({ mode, content, blocks: [] });
    }
  }

  if (note?.isPrivate && !isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex h-full flex-col items-center justify-center bg-white px-6 dark:bg-[#1C1C1E]"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#007AFF]/10">
          <Lock className="h-10 w-10 text-[#007AFF]" />
        </div>
        <h2 className="text-[28px] font-bold text-[#1C1C1E] dark:text-white">
          Locked
        </h2>
        <p className="mt-2 text-center text-[15px] text-[#8E8E93]">
          This note is protected with a PIN.
        </p>
        <button
          onClick={onBack}
          className="mt-6 rounded-[14px] bg-[#007AFF] px-6 py-2.5 text-[15px] font-semibold text-white"
        >
          Go back
        </button>
      </motion.div>
    );
  }

  if (!note) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="flex h-full flex-col items-center justify-center text-[#8E8E93]"
      >
        <p className="text-[15px]">Select a note to start editing</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-[14px] bg-[#007AFF] px-5 py-2 text-[15px] font-semibold text-white"
        >
          Go back
        </button>
      </motion.div>
    );
  }

  const wordCount = getWordCount(note);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-full flex-col bg-white dark:bg-[#1C1C1E]"
    >
      <div className="safe-top ios-glass flex items-center justify-between border-b border-[#F2F2F7] px-4 pb-3 pt-5 dark:border-[#38383A]">
        <button
          onClick={onBack}
          className="flex items-center gap-0.5 text-[#007AFF] active:opacity-60"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="text-[17px] font-semibold">Notes</span>
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowInfo(true)}
            className="rounded-full p-2 text-[#8E8E93] active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]"
            aria-label="Note info"
          >
            <Info className="h-5 w-5" />
          </button>
          <button
            onClick={onTogglePin}
            className={cn(
              "rounded-full p-2 transition-colors active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]",
              note.pinned ? "text-[#FF9500]" : "text-[#8E8E93]"
            )}
            aria-label={note.pinned ? "Unpin" : "Pin"}
          >
            <Pin className={cn("h-5 w-5", note.pinned && "fill-current")} />
          </button>
          <button
            onClick={onTogglePrivate}
            className={cn(
              "rounded-full p-2 transition-colors active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]",
              note.isPrivate ? "text-[#007AFF]" : "text-[#8E8E93]"
            )}
            aria-label={note.isPrivate ? "Unlock note" : "Lock note"}
          >
            {note.isPrivate ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Unlock className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onShare}
            className="rounded-full p-2 text-[#007AFF] active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
        <input
          ref={titleRef}
          type="text"
          value={note.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Untitled"
          className="w-full bg-transparent text-[32px] font-bold tracking-[-0.5px] text-[#1C1C1E] placeholder:text-[#C7C7CC] dark:text-white"
        />

        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[12px] font-semibold text-[#1C1C1E] dark:bg-[#2C2C2E] dark:text-white"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: TAG_COLORS[tag] }}
                />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5">
          <AnimatePresence mode="wait">
            {note.mode === "simple" ? (
              <motion.div
                key="simple"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  ref={textareaRef}
                  value={note.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Start writing..."
                  rows={6}
                  className="w-full resize-none bg-transparent text-[17px] leading-7 text-[#1C1C1E] placeholder:text-[#C7C7CC] dark:text-white"
                />
              </motion.div>
            ) : (
              <motion.div
                key="blocks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BlockEditor blocks={note.blocks} onChange={onUpdateBlocks} />
                <button
                  onClick={() => addBlockAtEnd("text")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#E5E5EA] py-3 text-[15px] font-medium text-[#8E8E93] transition-colors hover:border-[#007AFF] hover:text-[#007AFF] dark:border-[#38383A]"
                >
                  <Plus className="h-4 w-4" />
                  Add a block
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="safe-bottom ios-glass border-t border-[#F2F2F7] px-5 py-4 dark:border-[#38383A]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-[#8E8E93]" />
            {(Object.keys(TAG_COLORS) as TagType[]).map((tag) => {
              const active = note.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors",
                    active
                      ? "border-transparent bg-white text-[#1C1C1E] shadow-sm dark:bg-[#3A3A3C] dark:text-white"
                      : "border-[#E5E5EA] bg-transparent text-[#8E8E93] dark:border-[#38383A]"
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: TAG_COLORS[tag] }}
                  />
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-[#E5E5EA] p-1 dark:bg-[#2C2C2E]">
              <FolderButton
                active={note.folder === "note"}
                onClick={() => onUpdate({ folder: "note" })}
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Note"
              />
              <FolderButton
                active={note.folder === "plan"}
                onClick={() => onUpdate({ folder: "plan" })}
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                label="Plan"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => switchMode(note.mode === "simple" ? "blocks" : "simple")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  note.mode === "blocks"
                    ? "bg-[#AF52DE]/10 text-[#AF52DE] active:bg-[#AF52DE]/20"
                    : "bg-[#E5E5EA] text-[#1C1C1E] active:bg-[#D1D1D6] dark:bg-[#3A3A3C] dark:text-white"
                )}
              >
                {note.mode === "blocks" ? (
                  <Layers className="h-3.5 w-3.5" />
                ) : (
                  <Type className="h-3.5 w-3.5" />
                )}
                {note.mode === "blocks" ? "Blocks" : "Simple"}
              </button>
              {note.isPrivate && (
                <button
                  onClick={onChangePin}
                  className="flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 px-3 py-1.5 text-[12px] font-semibold text-[#007AFF] active:bg-[#007AFF]/20"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  PIN
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 rounded-full bg-[#FF3B30]/10 px-3 py-1.5 text-[12px] font-semibold text-[#FF3B30] active:bg-[#FF3B30]/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <BottomSheet onClose={() => setShowDeleteConfirm(false)}>
            <div className="ios-card overflow-hidden shadow-sm">
              <div className="border-b border-[#F2F2F7] px-4 py-4 text-center dark:border-[#38383A]">
                <p className="text-[15px] text-[#8E8E93]">
                  Move this note to Trash?
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete();
                }}
                className="w-full py-3.5 text-[17px] font-semibold text-[#FF3B30] active:bg-[#F2F2F7] dark:active:bg-[#3A3A3C]"
              >
                Move to Trash
              </button>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="ios-card mt-3 w-full py-3.5 text-[17px] font-semibold text-[#007AFF] active:bg-[#F2F2F7] dark:active:bg-[#3A3A3C]"
            >
              Cancel
            </button>
          </BottomSheet>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInfo && (
          <BottomSheet onClose={() => setShowInfo(false)}>
            <div className="ios-card p-5 shadow-sm">
              <h3 className="mb-4 text-[20px] font-bold text-[#1C1C1E] dark:text-white">
                Note info
              </h3>
              <div className="space-y-3 text-[15px]">
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Created</span>
                  <span className="font-medium text-[#1C1C1E] dark:text-white">
                    {formatNoteDate(note.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Updated</span>
                  <span className="font-medium text-[#1C1C1E] dark:text-white">
                    {formatNoteDate(note.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Words</span>
                  <span className="font-medium text-[#1C1C1E] dark:text-white">
                    {wordCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93]">Reading time</span>
                  <span className="font-medium text-[#1C1C1E] dark:text-white">
                    {getReadingTime(note)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="ios-card mt-3 w-full py-3.5 text-[17px] font-semibold text-[#007AFF] active:bg-[#F2F2F7] dark:active:bg-[#3A3A3C]"
            >
              Done
            </button>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FolderButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
        active ? "text-[#1C1C1E] dark:text-white" : "text-[#8E8E93]"
      )}
    >
      {active && (
        <motion.div
          layoutId="editor-folder-pill"
          className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-[#3A3A3C]"
        />
      )}
      <span className="relative z-10 flex items-center gap-1">
        {icon}
        {label}
      </span>
    </button>
  );
}

function BottomSheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-[28px] bg-[#F2F2F7] p-4 pb-8 dark:bg-[#1C1C1E]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#C7C7CC]" />
        {children}
      </motion.div>
    </motion.div>
  );
}

function getNoteBodyText(note: Note): string {
  return note.mode === "simple"
    ? note.content
    : note.blocks.map((b) => b.content).join("\n");
}
