"use client";

import { useState, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface ChatMessageProps {
  message: Message;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 text-sm leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc pl-4 space-y-1 text-sm leading-relaxed last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal pl-4 space-y-1 text-sm leading-relaxed last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[#f1f5f9]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-[#cbd5e1]">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-2 hover:text-indigo-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  pre: ({ children }) => (
    <pre className="markdown-pre mb-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#060810] p-3 text-[0.8125rem] leading-relaxed text-[#e2e8f0] last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.startsWith("language-"));
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.8125rem] text-cyan-100/90"
        {...props}
      >
        {children}
      </code>
    );
  },
};

function AssistantBody({ content }: { content: string }) {
  return (
    <div className="markdown-bot text-[#e2e8f0]">
      <Markdown components={markdownComponents}>{content}</Markdown>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy message"}
      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200"
      style={{
        color: copied ? "rgba(52, 211, 153, 0.95)" : "rgba(255,255,255,0.22)",
        background: copied ? "rgba(52, 211, 153, 0.1)" : "rgba(255,255,255,0.04)",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.22)";
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
        }
      }}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path
            fillRule="evenodd"
            d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3.75 3.75 0 0 1 3.75 3.75v1.875H13.5a1.125 1.125 0 0 0-1.125-1.125H9.375a1.875 1.875 0 0 0-1.875 1.875V15a1.875 1.875 0 0 0 1.875 1.875h.375A1.125 1.125 0 0 0 10.5 15.75v-1.875h3.375c1.035 0 1.875.84 1.875 1.875v3.375c0 1.035-.84 1.875-1.875 1.875H9.375a1.875 1.875 0 0 1-1.875-1.875V15a1.875 1.875 0 0 1 1.875-1.875h1.125v-1.875H9.375A3.75 3.75 0 0 1 5.625 7.5V5.25a1.875 1.875 0 0 1 1.875-1.875H7.5V3.375Z" />
          <path d="M15 5.25a1.875 1.875 0 0 1 1.875-1.875H18A3.75 3.75 0 0 1 21.75 7.5v9a3.75 3.75 0 0 1-3.75 3.75h-1.5a1.875 1.875 0 0 1-1.875-1.875v-1.5a1.875 1.875 0 0 1 1.875-1.875H18a1.875 1.875 0 0 0 1.875-1.875V9a1.875 1.875 0 0 0-1.875-1.875h-1.5A1.875 1.875 0 0 1 15 5.25Z" />
        </svg>
      )}
    </button>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`message-row flex w-full mb-5 ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-0.5 flex h-8 min-w-[2.75rem] items-center justify-center self-start">
          <span
            className="gradient-text font-display font-bold tracking-tight leading-none whitespace-nowrap"
            style={{ fontSize: "0.7rem" }}
          >
            Edge
          </span>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>
        {isUser ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3), 0 1px 3px rgba(0,0,0,0.4)",
              color: "#f5f3ff",
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        ) : (
          <div className="relative w-full pr-1">
            {message.content.length > 0 && <CopyButton text={message.content} />}
            <div
              className={`px-4 py-3 rounded-2xl rounded-tl-sm ${message.content.length > 0 ? "pr-11" : ""}`}
              style={{
                background: "rgba(11, 13, 22, 0.85)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.055)",
                borderLeft: "2px solid rgba(99, 102, 241, 0.45)",
                boxShadow: "0 2px 20px rgba(0, 0, 0, 0.35)",
                color: "#e2e8f0",
              }}
            >
              <AssistantBody content={message.content} />
            </div>
          </div>
        )}

        <span className="text-[11px] px-1" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ml-3 mt-0.5"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
            you
          </span>
        </div>
      )}
    </div>
  );
}
