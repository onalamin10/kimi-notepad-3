import { format } from "date-fns";
import type { Block, BlockType, Note, NoteMode, Tag } from "../types";

export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatNoteDate(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 1000 * 60) return "Just now";
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
  if (diff < 1000 * 60 * 60 * 24 * 7) return format(timestamp, "EEEE");
  return format(timestamp, "MMM d, yyyy");
}

export function createBlock(
  type: BlockType = "text",
  content = "",
  checked = false
): Block {
  return {
    id: generateId(),
    type,
    content,
    checked: type === "todo" ? checked : undefined,
  };
}

export function textToBlocks(text: string): Block[] {
  if (!text.trim()) return [createBlock("text")];
  return text.split("\n").map((line) => {
    const trimmed = line.trim();
    if (/^#\s+/.test(trimmed)) {
      return createBlock("heading", trimmed.replace(/^#\s+/, ""));
    }
    if (/^- \[[xX]\]\s+/.test(trimmed)) {
      return createBlock(
        "todo",
        trimmed.replace(/^- \[[xX]\]\s+/, ""),
        true
      );
    }
    if (/^- \[ \]\s+/.test(trimmed)) {
      return createBlock("todo", trimmed.replace(/^- \[ \]\s+/, ""), false);
    }
    if (/^[-•]\s+/.test(trimmed)) {
      return createBlock("bullet", trimmed.replace(/^[-•]\s+/, ""));
    }
    return createBlock("text", trimmed);
  });
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `# ${block.content}`;
        case "todo":
          return `- [${block.checked ? "x" : " "}] ${block.content}`;
        case "bullet":
          return `- ${block.content}`;
        default:
          return block.content;
      }
    })
    .join("\n");
}

export function migrateNote(note: any): Note {
  const mode: NoteMode = note.mode ?? "simple";
  const content = note.content ?? "";
  const blocks: Block[] = note.blocks
    ? note.blocks
    : mode === "blocks"
    ? textToBlocks(content)
    : [];

  return {
    id: note.id ?? generateId(),
    title: note.title ?? "",
    content,
    blocks,
    mode,
    folder: note.folder ?? "note",
    pinned: note.pinned ?? false,
    tags: note.tags ?? [],
    deletedAt: note.deletedAt ?? null,
    isPrivate: note.isPrivate ?? false,
    pinHash: note.pinHash ?? null,
    createdAt: note.createdAt ?? Date.now(),
    updatedAt: note.updatedAt ?? Date.now(),
  };
}

export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash << 5) - hash + pin.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

export function verifyPin(pin: string, hash: string | null): boolean {
  if (!hash) return false;
  return hashPin(pin) === hash;
}

export function getPlainText(blocks: Block[]): string {
  return blocks.map((b) => b.content).join("\n");
}

export function getNotePlainText(note: Note): string {
  if (note.mode === "blocks") {
    return getPlainText(note.blocks);
  }
  return note.content;
}

export function getWordCount(note: Note): number {
  const text = getNotePlainText(note).trim();
  return text ? text.split(/\s+/).length : 0;
}

export function getReadingTime(note: Note): string {
  const words = getWordCount(note);
  const minutes = Math.ceil(words / 200);
  return minutes <= 1 ? "1 min read" : `${minutes} min read`;
}

export function getTodoStats(note: Note) {
  if (note.mode === "simple") {
    const lines = note.content.split("\n");
    const todos = lines.filter((l) => /^\s*- \[[ xX]\] /.test(l));
    const completed = todos.filter((l) => /^\s*- \[[xX]\] /.test(l)).length;
    return { total: todos.length, completed };
  }
  const todos = note.blocks.filter((b) => b.type === "todo");
  const completed = todos.filter((b) => b.checked).length;
  return { total: todos.length, completed };
}

export function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

export const TAG_COLORS: Record<Tag, string> = {
  Personal: "#FF9500",
  Work: "#007AFF",
  Ideas: "#34C759",
  Important: "#FF3B30",
};
