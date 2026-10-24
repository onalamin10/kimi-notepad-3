import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete, Shield } from "lucide-react";
import { cn } from "../utils/cn";
import { hashPin, verifyPin } from "../utils/helpers";

type Mode = "unlock" | "create" | "change";

interface LockScreenProps {
  mode: Mode;
  title?: string;
  pinHash: string | null;
  onUnlock: () => void;
  onSetPin: (pinHash: string) => void;
  onCancel: () => void;
}

export function LockScreen({
  mode,
  title,
  pinHash,
  onUnlock,
  onSetPin,
  onCancel,
}: LockScreenProps) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");

  const isCreate = mode === "create" || mode === "change";

  function handleDigit(digit: string) {
    if (error) setError("");
    const target = isCreate && step === "confirm" ? confirmPin : pin;
    if (target.length >= 4) return;
    const next = target + digit;
    if (isCreate && step === "confirm") {
      setConfirmPin(next);
    } else {
      setPin(next);
    }
  }

  function handleDelete() {
    const target = isCreate && step === "confirm" ? confirmPin : pin;
    const next = target.slice(0, -1);
    if (isCreate && step === "confirm") {
      setConfirmPin(next);
    } else {
      setPin(next);
    }
  }

  function handleSubmit() {
    if (pin.length < 4) {
      setError("Enter 4 digits");
      return;
    }

    if (!isCreate) {
      if (verifyPin(pin, pinHash)) {
        onUnlock();
      } else {
        setError("Wrong PIN");
        setPin("");
      }
      return;
    }

    if (step === "enter") {
      setStep("confirm");
      return;
    }

    if (confirmPin.length < 4) {
      setError("Confirm your PIN");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs don't match");
      setPin("");
      setConfirmPin("");
      setStep("enter");
      return;
    }

    onSetPin(hashPin(pin));
  }

  const displayPin = isCreate && step === "confirm" ? confirmPin : pin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#F2F2F7] px-6 dark:bg-[#000000]"
    >
      <button
        onClick={onCancel}
        className="absolute right-5 top-6 rounded-full p-2 text-[#8E8E93] active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E]"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="ios-button mb-8 flex h-20 w-20 items-center justify-center">
        <Shield className="h-10 w-10 text-[#007AFF]" />
      </div>

      <h2 className="text-center text-[28px] font-bold text-[#1C1C1E] dark:text-white">
        {isCreate
          ? step === "enter"
            ? "Set a PIN"
            : "Confirm PIN"
          : "Private note"}
      </h2>
      {title && (
        <p className="mb-6 text-center text-[15px] text-[#8E8E93]">{title}</p>
      )}

      <div className="mb-2 flex items-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-3.5 w-3.5 rounded-full border-2 transition-colors",
              i < displayPin.length
                ? "border-[#007AFF] bg-[#007AFF]"
                : "border-[#C7C7CC] bg-transparent"
            )}
          />
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 text-[13px] font-medium text-[#FF3B30]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-6 grid w-full max-w-[280px] grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
          (key) => {
            if (key === "") {
              return <div key="empty" />;
            }
            if (key === "del") {
              return (
                <button
                  key={key}
                  onClick={handleDelete}
                  className="flex aspect-square items-center justify-center rounded-full text-[#1C1C1E] active:bg-[#E5E5EA] dark:text-white dark:active:bg-[#2C2C2E]"
                >
                  <Delete className="h-6 w-6" />
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                className="aspect-square rounded-full text-[28px] font-medium text-[#1C1C1E] active:bg-[#E5E5EA] dark:text-white dark:active:bg-[#2C2C2E]"
              >
                {key}
              </button>
            );
          }
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={displayPin.length < 4}
        className="mt-8 w-full max-w-[280px] rounded-[14px] bg-[#007AFF] py-3.5 text-[17px] font-semibold text-white shadow-sm transition-opacity disabled:opacity-40"
      >
        {isCreate
          ? step === "enter"
            ? "Continue"
            : "Set PIN"
          : "Unlock"}
      </button>
    </motion.div>
  );
}
