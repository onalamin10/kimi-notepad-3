import { useRef, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Type,
  Heading,
  List,
  Circle,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { Block, BlockType } from "../types";
import { createBlock } from "../utils/helpers";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

export function BlockEditor({ blocks, onChange, readOnly }: BlockEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep focus when blocks update if it was inside an editable
  useEffect(() => {
    const active = document.activeElement as HTMLElement | null;
    if (active?.dataset.blockId) {
      const id = active.dataset.blockId;
      const el = containerRef.current?.querySelector(
        `[data-block-id="${id}"] .block-input`
      ) as HTMLElement | null;
      if (el && el !== active) {
        el.focus();
      }
    }
  }, [blocks]);

  const updateBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      onChange(
        blocks.map((b) => (b.id === id ? { ...b, ...patch } : b))
      );
    },
    [blocks, onChange]
  );

  const addBlock = useCallback(
    (afterId: string, type: BlockType = "text") => {
      const index = blocks.findIndex((b) => b.id === afterId);
      const newBlock = createBlock(type);
      const next = [...blocks];
      next.splice(index + 1, 0, newBlock);
      onChange(next);
      setTimeout(() => focusBlock(newBlock.id), 0);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      const index = blocks.findIndex((b) => b.id === id);
      const prev = blocks[index - 1];
      onChange(blocks.filter((b) => b.id !== id));
      if (prev) setTimeout(() => focusBlockEnd(prev.id), 0);
    },
    [blocks, onChange]
  );

  const mergeWithPrevious = useCallback(
    (id: string) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index <= 0) return;
      const current = blocks[index];
      const prev = blocks[index - 1];
      const merged = { ...prev, content: prev.content + current.content };
      const next = [...blocks];
      next[index - 1] = merged;
      next.splice(index, 1);
      onChange(next);
      setTimeout(() => {
        const el = getInputEl(prev.id);
        if (el) {
          const pos = prev.content.length;
          setCursor(el, pos);
        }
      }, 0);
    },
    [blocks, onChange]
  );

  const setBlockType = useCallback(
    (id: string, type: BlockType) => {
      updateBlock(id, {
        type,
        checked: type === "todo" ? false : undefined,
      });
    },
    [updateBlock]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      const block = blocks.find((b) => b.id === id);
      if (block?.type === "todo") {
        updateBlock(id, { checked: !block.checked });
      }
    },
    [blocks, updateBlock]
  );

  return (
    <div ref={containerRef} className="space-y-0.5">
      {blocks.map((block, index) => (
        <BlockRow
          key={block.id}
          block={block}
          index={index}
          isFirst={index === 0}
          isLast={index === blocks.length - 1}
          readOnly={readOnly}
          onChange={(content) => updateBlock(block.id, { content })}
          onKeyDown={(e) => {
            const input = getInputEl(block.id);
            const cursor = input ? getCursor(input) : 0;
            const isEmpty = block.content === "";

            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (block.type === "todo" || block.type === "bullet") {
                if (isEmpty) {
                  setBlockType(block.id, "text");
                  addBlock(block.id, "text");
                } else {
                  addBlock(block.id, block.type);
                }
              } else {
                addBlock(block.id, "text");
              }
            }

            if (e.key === "Backspace" && isEmpty && blocks.length > 1) {
              e.preventDefault();
              deleteBlock(block.id);
            }

            if (e.key === "Backspace" && cursor === 0 && index > 0) {
              e.preventDefault();
              mergeWithPrevious(block.id);
            }

            if (e.key === "ArrowDown") {
              const next = blocks[index + 1];
              if (next) {
                e.preventDefault();
                focusBlock(next.id, cursor);
              }
            }

            if (e.key === "ArrowUp") {
              const prev = blocks[index - 1];
              if (prev) {
                e.preventDefault();
                focusBlock(prev.id, cursor);
              }
            }
          }}
          onToggleTodo={() => toggleTodo(block.id)}
          onSetType={(type) => setBlockType(block.id, type)}
        />
      ))}
    </div>
  );
}

function BlockRow({
  block,
  isLast,
  readOnly,
  onChange,
  onKeyDown,
  onToggleTodo,
  onSetType,
}: {
  block: Block;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
  onChange: (content: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onToggleTodo: () => void;
  onSetType: (type: BlockType) => void;
}) {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (el.innerText !== block.content) {
      el.innerText = block.content;
    }
  }, [block.content]);

  const placeholder =
    block.type === "heading" ? "Heading" : 'Type "/" for commands';

  return (
    <div
      data-block-id={block.id}
      className={cn(
        "group relative flex items-start gap-2 rounded-md px-2 py-1 transition-colors hover:bg-[#F2F2F7]/50 dark:hover:bg-[#2C2C2E]/50",
        block.type === "heading" && "py-2"
      )}
    >
      <div className="mt-1.5 flex w-5 shrink-0 items-center justify-center">
        <BlockIcon
          type={block.type}
          checked={block.checked}
          onToggle={onToggleTodo}
        />
      </div>

      <div className="relative min-w-0 flex-1">
        <div
          ref={inputRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerText)}
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            if (isLast && e.currentTarget.innerText.trim() === "" && block.type === "text") {
              // Keep empty last block as placeholder
            }
          }}
          className={cn(
            "block-input w-full whitespace-pre-wrap bg-transparent outline-none empty:before:pointer-events-none empty:before:text-[#C7C7CC]",
            block.type === "text" && "text-lg leading-7 text-[#1C1C1E] dark:text-white",
            block.type === "heading" && "text-2xl font-bold text-[#1C1C1E] dark:text-white",
            block.type === "todo" && "text-lg leading-7 text-[#1C1C1E] dark:text-white",
            block.type === "bullet" && "text-lg leading-7 text-[#1C1C1E] dark:text-white"
          )}
          style={{
            minHeight: "1.5em",
          }}
          data-placeholder={placeholder}
        />
        {block.content === "" && (
          <span className="pointer-events-none absolute left-0 top-0 select-none text-[#C7C7CC]">
            {placeholder}
          </span>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <TypeButton
            active={block.type === "text"}
            onClick={() => onSetType("text")}
            icon={<Type className="h-3.5 w-3.5" />}
          />
          <TypeButton
            active={block.type === "heading"}
            onClick={() => onSetType("heading")}
            icon={<Heading className="h-3.5 w-3.5" />}
          />
          <TypeButton
            active={block.type === "todo"}
            onClick={() => onSetType("todo")}
            icon={<CheckSquare className="h-3.5 w-3.5" />}
          />
          <TypeButton
            active={block.type === "bullet"}
            onClick={() => onSetType("bullet")}
            icon={<List className="h-3.5 w-3.5" />}
          />
        </div>
      )}
    </div>
  );
}

function BlockIcon({
  type,
  checked,
  onToggle,
}: {
  type: BlockType;
  checked?: boolean;
  onToggle: () => void;
}) {
  if (type === "todo") {
    return (
      <button
        onClick={onToggle}
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors",
          checked
            ? "border-[#34C759] bg-[#34C759] text-white"
            : "border-[#C7C7CC] bg-transparent text-transparent"
        )}
      >
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
    );
  }
  if (type === "bullet") {
    return <Circle className="h-2 w-2 fill-[#8E8E93] text-[#8E8E93]" />;
  }
  if (type === "heading") {
    return <Heading className="h-4 w-4 text-[#8E8E93]" />;
  }
  return <div className="h-4 w-4" />;
}

function TypeButton({
  active,
  onClick,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded p-1 transition-colors",
        active
          ? "bg-[#007AFF]/10 text-[#007AFF]"
          : "text-[#C7C7CC] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E]"
      )}
    >
      {icon}
    </button>
  );
}

function getInputEl(blockId: string): HTMLDivElement | null {
  return document.querySelector(
    `[data-block-id="${blockId}"] .block-input`
  ) as HTMLDivElement | null;
}

function focusBlock(blockId: string, position?: number) {
  const el = getInputEl(blockId);
  if (!el) return;
  el.focus();
  if (position !== undefined) setCursor(el, position);
}

function focusBlockEnd(blockId: string) {
  const el = getInputEl(blockId);
  if (!el) return;
  el.focus();
  setCursor(el, el.innerText.length);
}

function getCursor(el: HTMLDivElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(el);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

function setCursor(el: HTMLDivElement, position: number) {
  const text = el.firstChild;
  if (!text) return;
  const range = document.createRange();
  const selection = window.getSelection();
  const safePos = Math.min(position, text.textContent?.length ?? 0);
  range.setStart(text, safePos);
  range.collapse(true);
  selection?.removeAllRanges();
  selection?.addRange(range);
}
