import { motion } from "framer-motion";
import {
  ChevronLeft,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "../utils/cn";
import type { AppSettings } from "../types";

interface SettingsViewProps {
  settings: AppSettings;
  onPatchSettings: (patch: Partial<AppSettings>) => void;
  onBack: () => void;
  onOpenTrash: () => void;
  onExport: () => void;
  trashCount: number;
}

export function SettingsView({
  settings,
  onPatchSettings,
  onBack,
  onOpenTrash,
  onExport,
  trashCount,
}: SettingsViewProps) {
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
          <span className="text-[17px] font-semibold">Back</span>
        </button>
        <h1 className="ml-3 text-[20px] font-bold text-[#1C1C1E] dark:text-white">
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar">
        <section className="mb-5">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            Appearance
          </h2>
          <div className="ios-card overflow-hidden p-1">
            {([
              { key: "light", label: "Light", icon: Sun },
              { key: "dark", label: "Dark", icon: Moon },
              { key: "system", label: "System", icon: Monitor },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onPatchSettings({ darkMode: key })}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                  settings.darkMode === key
                    ? "text-[#007AFF]"
                    : "text-[#1C1C1E] dark:text-white"
                )}
              >
                <span className="flex items-center gap-3 text-[17px] font-medium">
                  <Icon className="h-5 w-5" />
                  {label}
                </span>
                {settings.darkMode === key && (
                  <span className="h-2 w-2 rounded-full bg-[#007AFF]" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            Default view
          </h2>
          <div className="ios-card flex overflow-hidden p-1">
            {([
              { key: "grid", label: "Grid", icon: LayoutGrid },
              { key: "list", label: "List", icon: List },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => onPatchSettings({ view: key })}
                className={cn(
                  "relative flex-1 rounded-xl py-2.5 text-[15px] font-semibold transition-colors",
                  settings.view === key
                    ? "text-[#1C1C1E] dark:text-white"
                    : "text-[#8E8E93]"
                )}
              >
                {settings.view === key && (
                  <motion.div
                    layoutId="settings-view-pill"
                    className="absolute inset-0 rounded-xl bg-[#F2F2F7] dark:bg-[#3A3A3C]"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">
            Data
          </h2>
          <div className="ios-card overflow-hidden">
            <button
              onClick={onOpenTrash}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-[#F2F2F7] dark:active:bg-[#3A3A3C]"
            >
              <span className="flex items-center gap-3 text-[17px] font-medium text-[#1C1C1E] dark:text-white">
                <Trash2 className="h-5 w-5 text-[#8E8E93]" />
                Trash
              </span>
              <span className="rounded-full bg-[#E5E5EA] px-2.5 py-0.5 text-[12px] font-semibold text-[#8E8E93] dark:bg-[#3A3A3C]">
                {trashCount}
              </span>
            </button>
            <div className="mx-4 h-px bg-[#F2F2F7] dark:bg-[#38383A]" />
            <button
              onClick={onExport}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[17px] font-medium text-[#1C1C1E] active:bg-[#F2F2F7] dark:text-white dark:active:bg-[#3A3A3C]"
            >
              <Download className="h-5 w-5 text-[#8E8E93]" />
              Export notes
            </button>
          </div>
        </section>

        <p className="px-1 text-center text-[12px] text-[#8E8E93]">
          Notes are stored locally on your device.
        </p>
      </div>
    </motion.div>
  );
}
