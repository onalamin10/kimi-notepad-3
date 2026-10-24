import { FileText } from "lucide-react";
import type { Folder } from "../types";

interface EmptyStateProps {
  folder: "all" | "private" | Folder;
  onCreate: () => void;
}

export function EmptyState({ folder, onCreate }: EmptyStateProps) {
  const label =
    folder === "all"
      ? "notes or plans"
      : folder === "private"
      ? "private notes"
      : folder === "note"
      ? "notes"
      : "plans";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="ios-button mb-5 flex h-20 w-20 items-center justify-center">
        <FileText className="h-10 w-10 text-[#C7C7CC]" />
      </div>
      <h3 className="text-[20px] font-semibold text-[#1C1C1E] dark:text-white">
        No {label} yet
      </h3>
      <p className="mt-1 max-w-[220px] text-[15px] leading-relaxed text-[#8E8E93]">
        Tap the button below to create your first{" "}
        {folder === "plan" ? "plan" : "note"}.
      </p>
      <button
        onClick={onCreate}
        className="mt-6 rounded-[14px] bg-[#007AFF] px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm active:scale-95"
      >
        Create {folder === "plan" ? "Plan" : "Note"}
      </button>
    </div>
  );
}
