"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Conversation } from "@/lib/supabase/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  refreshTrigger: number;
}

export default function Sidebar({
  isOpen,
  onClose,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  refreshTrigger,
}: SidebarProps) {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshTrigger]);

  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await supabase.from("conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) onNewChat();
    setDeletingId(null);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full z-30 flex flex-col w-60 flex-shrink-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isOpen ? "md:flex" : "md:hidden"}`}
        style={{
          background: "#050609",
          borderRight: "1px solid rgba(255, 255, 255, 0.045)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.045)" }}
        >
          <span
            className="text-[10px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: "rgba(255,255,255,0.22)" }}
          >
            Chats
          </span>
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "rgba(165, 180, 252, 0.85)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(99, 102, 241, 0.15)";
              el.style.borderColor = "rgba(99, 102, 241, 0.4)";
              el.style.color = "#a5b4fc";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(99, 102, 241, 0.08)";
              el.style.borderColor = "rgba(99, 102, 241, 0.2)";
              el.style.color = "rgba(165, 180, 252, 0.85)";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            New Chat
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.07)", borderTopColor: "#6366f1" }}
              />
            </div>
          ) : conversations.length === 0 ? (
            <p
              className="text-xs text-center py-10 px-3 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.15)" }}
            >
              No conversations yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <li key={conv.id}>
                    <button
                      onClick={() => { onSelectConversation(conv.id); onClose(); }}
                      className="group w-full flex items-center justify-between rounded-xl text-left transition-all duration-150"
                      style={{
                        padding: "10px 12px 10px 10px",
                        background: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
                        borderLeft: isActive
                          ? "2px solid rgba(99, 102, 241, 0.6)"
                          : "2px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <span
                        className="text-xs leading-snug line-clamp-1 flex-1 pr-2"
                        style={{ color: isActive ? "#c7d2fe" : "rgba(255,255,255,0.32)" }}
                      >
                        {conv.title ?? "Untitled"}
                      </span>

                      <button
                        onClick={(e) => deleteConversation(e, conv.id)}
                        disabled={deletingId === conv.id}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 p-0.5 rounded"
                        style={{ color: "rgba(255,255,255,0.22)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.22)";
                        }}
                      >
                        {deletingId === conv.id ? (
                          <div
                            className="w-3 h-3 rounded-full border animate-spin"
                            style={{ borderColor: "rgba(255,255,255,0.08)", borderTopColor: "#f87171" }}
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
