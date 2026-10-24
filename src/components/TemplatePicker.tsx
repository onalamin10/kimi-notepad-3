import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, CheckSquare, Users, BookOpen } from "lucide-react";
import type { Block, NoteMode } from "../types";
import { createBlock } from "../utils/helpers";

interface Template {
  id: string;
  title: string;
  icon: React.ReactNode;
  mode: NoteMode;
  content?: string;
  blocks?: Block[];
}

const TEMPLATES: Template[] = [
  {
    id: "blank",
    title: "Blank note",
    icon: <FileText className="h-5 w-5 text-[#007AFF]" />,
    mode: "simple",
    content: "",
  },
  {
    id: "todo",
    title: "To-do list",
    icon: <CheckSquare className="h-5 w-5 text-[#34C759]" />,
    mode: "blocks",
    blocks: [
      createBlock("todo", "Task one", false),
      createBlock("todo", "Task two", false),
      createBlock("todo", "Task three", false),
    ],
  },
  {
    id: "meeting",
    title: "Meeting notes",
    icon: <Users className="h-5 w-5 text-[#FF9500]" />,
    mode: "blocks",
    blocks: [
      createBlock("heading", "Agenda"),
      createBlock("bullet", "Topic one"),
      createBlock("bullet", "Topic two"),
      createBlock("heading", "Action items"),
      createBlock("todo", "Follow up", false),
    ],
  },
  {
    id: "journal",
    title: "Daily journal",
    icon: <BookOpen className="h-5 w-5 text-[#AF52DE]" />,
    mode: "blocks",
    blocks: [
      createBlock("heading", "Today"),
      createBlock("text", "What happened today?"),
      createBlock("heading", "Gratitude"),
      createBlock("bullet", "One thing I'm grateful for"),
    ],
  },
];

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mode: NoteMode, content: string, blocks: Block[]) => void;
}

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-[#F2F2F7] p-5 pb-10 dark:bg-[#1C1C1E]"
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#C7C7CC]" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-[#1C1C1E] dark:text-white">
                Choose template
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#8E8E93] active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() =>
                    onSelect(
                      template.mode,
                      template.content ?? "",
                      template.blocks ?? []
                    )
                  }
                  className="ios-button flex flex-col items-start gap-3 p-4 text-left transition-transform active:scale-95"
                >
                  <div className="ios-button flex h-10 w-10 items-center justify-center">
                    {template.icon}
                  </div>
                  <span className="text-[15px] font-semibold text-[#1C1C1E] dark:text-white">
                    {template.title}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
