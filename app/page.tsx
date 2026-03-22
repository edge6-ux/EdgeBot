"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import ChatMessage, { type Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import type { DBMessage } from "@/lib/supabase/types";

function TypingIndicator() {
  return (
    <div className="message-enter flex items-start mb-5">
      <div className="flex-shrink-0 mr-3 mt-0.5 flex h-8 min-w-[2.75rem] items-center justify-center self-start">
        <span
          className="gradient-text font-display font-bold tracking-tight leading-none whitespace-nowrap"
          style={{ fontSize: "0.7rem" }}
        >
          Edge
        </span>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-tl-sm"
        style={{
          background: "rgba(11, 13, 22, 0.85)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.055)",
          borderLeft: "2px solid rgba(99, 102, 241, 0.45)",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div className="flex gap-1.5 items-center h-5">
          <span
            className="typing-dot w-1.5 h-1.5 rounded-full block"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
          />
          <span
            className="typing-dot w-1.5 h-1.5 rounded-full block"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
          />
          <span
            className="typing-dot w-1.5 h-1.5 rounded-full block"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
          />
        </div>
      </div>
    </div>
  );
}

type StarterAccent = "indigo" | "violet" | "cyan" | "mixed";

const CONVERSATION_STARTERS: ReadonlyArray<{
  send: string;
  title: string;
  hint: string;
  wide: boolean;
  accent: StarterAccent;
  icon: "spark" | "compass" | "bolt" | "chat";
}> = [
  {
    send: "Ask me anything",
    title: "Ask me anything",
    hint: "Curiosity first — no topic too random.",
    wide: true,
    accent: "mixed",
    icon: "spark",
  },
  {
    send: "I need some advice",
    title: "I need advice",
    hint: "Straight talk, no fluff.",
    wide: false,
    accent: "indigo",
    icon: "compass",
  },
  {
    send: "Let's brainstorm something",
    title: "Brainstorm",
    hint: "Ideas, angles, what-ifs.",
    wide: false,
    accent: "violet",
    icon: "bolt",
  },
  {
    send: "Just wanna talk",
    title: "Just talk",
    hint: "No agenda — I'm here.",
    wide: true,
    accent: "cyan",
    icon: "chat",
  },
];

function StarterIcon({ name }: { name: (typeof CONVERSATION_STARTERS)[number]["icon"] }) {
  const className = "h-5 w-5 shrink-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100";
  switch (name) {
    case "spark":
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813a3.75 3.75 0 0 0 2.576-2.576l.813-2.846A.75.75 0 0 1 9 4.5ZM18.259 8.715a.75.75 0 0 1 .53.918l-.259 1.035a3.375 3.375 0 0 0 2.455 2.456l1.036.259a.75.75 0 0 1 0 1.442l-1.035.259a3.375 3.375 0 0 0-2.456 2.456l-.259 1.035a.75.75 0 0 1-1.442 0l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456l-1.035-.259a.75.75 0 0 1 0-1.442l1.035-.259a3.375 3.375 0 0 0 2.456-2.456l.259-1.035a.75.75 0 0 1 .972-.53Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "compass":
      return (
        <svg
          className={`${className} text-indigo-300`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={`${className} text-violet-300`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.25 10.25a.75.75 0 0 1-1.272-.41l1.517-7.391H4.42a.75.75 0 0 1-.548-1.262l10.25-10.25a.75.75 0 0 1 .493-.104Z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "chat":
      return (
        <svg
          className={`${className} text-cyan-300`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M7.5 8.25h9m-9 3H12m-4.5 3H15M21 12a9 9 0 01-9 9H9l-4.5 3v-3.086a9 9 0 01-2.565-5.565A9 9 0 0112 3a9 9 0 019 9z" />
        </svg>
      );
    default:
      return null;
  }
}

function accentBarStyle(accent: StarterAccent): CSSProperties {
  switch (accent) {
    case "indigo":
      return { background: "linear-gradient(180deg, #818cf8, #6366f1)" };
    case "violet":
      return { background: "linear-gradient(180deg, #c4b5fd, #8b5cf6)" };
    case "cyan":
      return { background: "linear-gradient(180deg, #67e8f9, #22d3ee)" };
    default:
      return { background: "linear-gradient(180deg, #a5b4fc, #22d3ee)" };
  }
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning.";
  if (h >= 12 && h < 17) return "Good afternoon.";
  if (h >= 17 && h < 22) return "Good evening.";
  return "Hey — late night? I'm here.";
}

function OrbBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Orb 1 — indigo */}
      <div style={{
        position: "absolute",
        top: "15%", left: "10%",
        width: 420, height: 420, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0.18) 40%, transparent 70%)",
        filter: "blur(60px)",
        animation: "bounce1 18s ease-in-out infinite",
      }} />

      {/* Orb 2 — violet */}
      <div style={{
        position: "absolute",
        top: "10%", right: "10%",
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(167,139,250,0.18) 40%, transparent 70%)",
        filter: "blur(55px)",
        animation: "bounce2 22s ease-in-out infinite",
        animationDelay: "-7s",
      }} />

      {/* Orb 3 — cyan */}
      <div style={{
        position: "absolute",
        bottom: "15%", left: "42%",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.38) 0%, rgba(34,211,238,0.12) 45%, transparent 70%)",
        filter: "blur(50px)",
        animation: "bounce3 16s ease-in-out infinite",
        animationDelay: "-4s",
      }} />
    </div>
  );
}

function WelcomeScreen({ onStarter }: { onStarter: (text: string) => void }) {
  const greeting = getTimeGreeting();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 px-4 sm:px-6 select-none translate-y-[min(6vh,4rem)] z-10 w-full max-w-2xl mx-auto">
      <h2
        className="gradient-text font-display font-bold tracking-tight leading-none text-center"
        style={{
          fontSize: "clamp(2rem, 6vw, 3.25rem)",
          filter: "drop-shadow(0 0 28px rgba(99, 102, 241, 0.35))",
        }}
      >
        EdgeBot
      </h2>
      <p
        className="mt-4 font-welcome text-lg sm:text-xl font-semibold tracking-tight text-center max-w-md"
        style={{ color: "rgba(226, 232, 240, 0.88)" }}
      >
        {greeting}
      </p>
      <p className="mt-2 text-sm text-center max-w-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
        {"Tap a card or say what's on your mind below."}
      </p>

      <div className="mt-10 w-full grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
        {CONVERSATION_STARTERS.map((item, i) => (
          <button
            key={item.send}
            type="button"
            onClick={() => onStarter(item.send)}
            className={`starter-tile-animate group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(10,12,20,0.72)] px-4 py-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.38)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/[0.16] hover:shadow-[0_16px_48px_rgba(99,102,241,0.14)] active:scale-[0.99] ${item.wide ? "sm:col-span-2" : ""}`}
            style={{ animationDelay: `${i * 85}ms` }}
          >
            <span
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-cyan-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden
            />
            <span
              className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-75 transition-opacity group-hover:opacity-100"
              style={accentBarStyle(item.accent)}
              aria-hidden
            />
            <span className="relative flex items-start gap-3 pl-3.5">
              <StarterIcon name={item.icon} />
              <span className="min-w-0 flex-1">
                <span
                  className={`font-display font-semibold tracking-tight text-[#eef2ff] transition-colors group-hover:text-white block ${item.wide ? "text-base sm:text-lg" : "text-sm"}`}
                >
                  {item.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
                  {item.hint}
                </span>
              </span>
              <svg
                className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-indigo-300/70"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const mainRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<string | null>(null);
  const stickToBottomRef = useRef(true);
  const messagesLenRef = useRef(0);
  messagesLenRef.current = messages.length;

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Sync ref with state
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // Auth listener — no redirects, auth is optional
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMainScroll = useCallback(() => {
    const el = mainRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    const pinned = dist < 100;
    stickToBottomRef.current = pinned;
    setShowScrollToBottom(messagesLenRef.current > 0 && !pinned);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    handleMainScroll();
    el.addEventListener("scroll", handleMainScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleMainScroll);
  }, [handleMainScroll]);

  useLayoutEffect(() => {
    if (messages.length === 0 && streamingContent === null) return;
    if (!stickToBottomRef.current) return;
    const streaming = streamingContent !== null || isLoading;
    bottomRef.current?.scrollIntoView({ behavior: streaming ? "auto" : "smooth" });
  }, [messages, streamingContent, isLoading]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => handleMainScroll());
    return () => cancelAnimationFrame(id);
  }, [messages, streamingContent, isLoading, handleMainScroll]);

  const scrollToBottomSmooth = useCallback(() => {
    stickToBottomRef.current = true;
    setShowScrollToBottom(false);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMessages([]);
    setStreamingContent(null);
    stickToBottomRef.current = true;
    setShowScrollToBottom(false);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(
        (data as DBMessage[]).map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      );
    }
  }, [supabase]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent(null);
    setSidebarOpen(false);
    stickToBottomRef.current = true;
    setShowScrollToBottom(false);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    startNewChat();
  };

  const sendMessage = useCallback(
    async (content: string) => {
      stickToBottomRef.current = true;
      setShowScrollToBottom(false);

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setStreamingContent("");

      // Persist only when logged in
      let convId = activeConvRef.current;
      if (user) {
        if (!convId) {
          const title = content.length > 40 ? content.slice(0, 40) + "…" : content;
          const { data: conv, error } = await supabase
            .from("conversations")
            .insert({ user_id: user.id, title })
            .select()
            .single();

          if (error || !conv) {
            setIsLoading(false);
            setStreamingContent(null);
            return;
          }

          convId = conv.id;
          setActiveConversationId(conv.id);
          setSidebarRefresh((n) => n + 1);
        }

        await supabase.from("messages").insert({
          conversation_id: convId,
          role: "user",
          content,
        });

        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      }

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: user?.user_metadata?.name ?? null,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || "Request failed");
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

        let accumulated = "";
        setIsLoading(false);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") {
              const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: accumulated,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent(null);

              // Save assistant message to DB (logged-in users only)
              if (user) {
                const finalConvId = activeConvRef.current ?? convId;
                if (finalConvId) {
                  await supabase.from("messages").insert({
                    conversation_id: finalConvId,
                    role: "assistant",
                    content: accumulated,
                  });
                  await supabase
                    .from("conversations")
                    .update({ updated_at: new Date().toISOString() })
                    .eq("id", finalConvId);
                  setSidebarRefresh((n) => n + 1);
                }
              }
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.delta) {
                accumulated += parsed.delta;
                setStreamingContent(accumulated);
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            err instanceof Error
              ? `Damn, something broke: ${err.message}`
              : "Something went sideways. Try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStreamingContent(null);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, user, supabase]
  );

  const isBusy = isLoading || streamingContent !== null;

  const isEmpty = messages.length === 0 && !isBusy;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "var(--bg)" }}>
      {isEmpty && <OrbBackground />}
      {/* Sidebar */}
      {user && (
        <Sidebar
          isOpen={sidebarOpen || sidebarVisible}
          onClose={() => { setSidebarOpen(false); setSidebarVisible(false); }}
          activeConversationId={activeConversationId}
          onSelectConversation={loadConversation}
          onNewChat={() => startNewChat()}
          refreshTrigger={sidebarRefresh}
        />
      )}

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 relative">

        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 py-3.5"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.045)",
            background: "rgba(7, 8, 13, 0.85)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => { setSidebarOpen((o) => !o); setSidebarVisible((v) => !v); }}
                className="p-1.5 rounded-lg transition-all duration-200"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Wordmark — new chat / home */}
            <button
              type="button"
              onClick={() => {
                startNewChat();
                router.push("/");
              }}
              className="text-left rounded-lg -mx-1 px-1 py-0.5 transition-opacity hover:opacity-[0.92] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(7,8,13,0.95)]"
              aria-label="EdgeBot — start new chat"
            >
              <h1 className="gradient-text font-display font-bold tracking-tight leading-none" style={{ fontSize: "1.05rem" }}>
                EdgeBot
              </h1>
              <p
                className="text-[10px] mt-0.5 hidden sm:block tracking-wide"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                LLaMA 3 · Groq
              </p>
            </button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {messages.length > 0 && !isBusy && user && (
              <button
                onClick={() => startNewChat()}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hidden sm:block"
                style={{ color: "rgba(255,255,255,0.28)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.28)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                New chat
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2.5">
                {/* Avatar ring */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                    padding: "1.5px",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: "#07080d" }}
                  >
                    <span className="gradient-text text-[10px] font-black">
                      {(user.user_metadata?.name as string)?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  </div>
                </div>

                <span
                  className="text-xs hidden sm:block max-w-[130px] truncate"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {(user.user_metadata?.name as string) ?? user.email}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-xs px-2.5 py-1 rounded-lg transition-all duration-200"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(248, 113, 113, 0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.28)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth")}
                className="text-xs font-medium px-3.5 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: "rgba(99, 102, 241, 0.08)",
                  border: "1px solid rgba(99, 102, 241, 0.22)",
                  color: "rgba(165, 180, 252, 0.8)",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(99, 102, 241, 0.15)"; el.style.borderColor = "rgba(99, 102, 241, 0.4)"; el.style.color = "#a5b4fc"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(99, 102, 241, 0.08)"; el.style.borderColor = "rgba(99, 102, 241, 0.22)"; el.style.color = "rgba(165, 180, 252, 0.8)"; }}
              >
                Sign in to save chats
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <main ref={mainRef} className="flex-1 overflow-y-auto min-h-0">
          <div className="max-w-3xl mx-auto px-4 py-8 min-h-full flex flex-col relative">
            {messages.length === 0 && !isBusy ? (
              <WelcomeScreen onStarter={(text) => void sendMessage(text)} />
            ) : (
              <div className="flex-1">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}

                {streamingContent !== null && streamingContent.length > 0 && (
                  <ChatMessage
                    message={{
                      id: "streaming",
                      role: "assistant",
                      content: streamingContent,
                      timestamp: new Date(),
                    }}
                  />
                )}

                {(isLoading || (streamingContent !== null && streamingContent.length === 0)) && (
                  <TypingIndicator />
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </main>

        {messages.length > 0 && showScrollToBottom && (
          <button
            type="button"
            onClick={scrollToBottomSmooth}
            className="absolute z-30 flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 active:scale-95"
            style={{
              bottom: "6.75rem",
              right: "1.25rem",
              background: "rgba(11, 13, 22, 0.92)",
              border: "1px solid rgba(99, 102, 241, 0.28)",
              color: "rgba(199, 210, 254, 0.95)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.45), 0 0 20px rgba(99, 102, 241, 0.12)",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(99, 102, 241, 0.45)";
              el.style.background = "rgba(99, 102, 241, 0.12)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(99, 102, 241, 0.28)";
              el.style.background = "rgba(11, 13, 22, 0.92)";
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-90">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v16.19l6.22-6.22a.75.75 0 1 1 1.06 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 1 1 1.06-1.06l6.22 6.22V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            To bottom
          </button>
        )}

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isBusy} />
      </div>
    </div>
  );
}
