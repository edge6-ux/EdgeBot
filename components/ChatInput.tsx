"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const MAX_LINES = 4;

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeToContent = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 22;
    const maxScroll = Math.ceil(lineHeight * MAX_LINES);

    ta.style.height = "auto";
    const next = Math.min(ta.scrollHeight, maxScroll);
    ta.style.height = `${next}px`;
    ta.style.overflowY = ta.scrollHeight > maxScroll ? "auto" : "hidden";
  }, []);

  useEffect(() => {
    resizeToContent();
  }, [value, resizeToContent]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.overflowY = "hidden";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div
      className="flex-shrink-0 px-4 pb-5 pt-4"
      style={{ borderTop: "1px solid rgba(255, 255, 255, 0.045)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="input-glow flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-300"
          style={{
            background: "rgba(11, 13, 22, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            opacity: disabled ? 0.55 : 1,
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Say something..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed min-h-[24px]"
            style={{
              color: "#e2e8f0",
              caretColor: "#818cf8",
            }}
          />
          <style>{`textarea::placeholder { color: rgba(255,255,255,0.18); }`}</style>

          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            style={
              canSend
                ? {
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 0 18px rgba(99, 102, 241, 0.45)",
                  }
                : {
                    background: "rgba(255, 255, 255, 0.04)",
                    cursor: "not-allowed",
                  }
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
              style={{ color: canSend ? "white" : "rgba(255,255,255,0.2)" }}
            >
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
            </svg>
          </button>
        </div>

        <p
          className="text-center text-[11px] mt-2 tracking-wide"
          style={{ color: "rgba(255,255,255,0.12)" }}
        >
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
