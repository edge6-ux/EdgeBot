"use client";

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

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`message-enter flex w-full mb-5 ${isUser ? "justify-end" : "justify-start"}`}>

      {/* Bot avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
            boxShadow: "0 0 14px rgba(99, 102, 241, 0.45)",
          }}
        >
          <span className="text-[11px] font-black text-white tracking-tight">E</span>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} max-w-[78%]`}>

        {/* Bubble */}
        {isUser ? (
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: "0 4px 20px rgba(79, 70, 229, 0.3), 0 1px 3px rgba(0,0,0,0.4)",
              color: "#f5f3ff",
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        ) : (
          <div
            className="px-4 py-3 rounded-2xl rounded-tl-sm"
            style={{
              background: "rgba(11, 13, 22, 0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.055)",
              borderLeft: "2px solid rgba(99, 102, 241, 0.45)",
              boxShadow: "0 2px 20px rgba(0, 0, 0, 0.35)",
              color: "#e2e8f0",
            }}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <span
          className="text-[11px] px-1"
          style={{ color: "rgba(255, 255, 255, 0.2)" }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* User avatar */}
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
