"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
          boxShadow: "0 0 14px rgba(99, 102, 241, 0.45)",
        }}
      >
        <span className="text-[11px] font-black text-white tracking-tight">E</span>
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

const GREETINGS = [
  (name?: string) => name ? `Yo ${name}, what's good?` : "Yo, what's good?",
  (name?: string) => name ? `What's going on, ${name}?` : "What's going on?",
  (name?: string) => name ? `Talk to me, ${name}.` : "Talk to me.",
  (name?: string) => "What's the move?",
  (name?: string) => "What are we getting into today?",
  (name?: string) => name ? `What's on your mind, ${name}?` : "What's on your mind?",
  (name?: string) => "I'm all ears.",
  (name?: string) => name ? `What's poppin', ${name}?` : "What's poppin'?",
  (name?: string) => "Hit me.",
  (name?: string) => "What we working with?",
];

function pickGreeting(name?: string): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)](name);
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

function EmptyState({ greeting }: { greeting: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 select-none">
      <p
        className="gradient-text relative font-display font-extrabold tracking-tight leading-none text-center"
        style={{
          zIndex: 10,
          fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
          filter: "drop-shadow(0 0 30px rgba(99, 102, 241, 0.4))",
          maxWidth: "16ch",
        }}
      >
        {greeting}
      </p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState(() => pickGreeting());

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string | null>(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<string | null>(null);

  // Sync ref with state
  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // Auth listener — no redirects, auth is optional
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setGreeting(pickGreeting(user?.user_metadata?.name ?? undefined));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isLoading, scrollToBottom]);

  const loadConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setMessages([]);
    setStreamingContent(null);

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

  const startNewChat = useCallback((userName?: string) => {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent(null);
    setSidebarOpen(false);
    setGreeting(pickGreeting(userName));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    startNewChat(undefined);
  };

  const sendMessage = useCallback(
    async (content: string) => {
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
          onNewChat={() => startNewChat(user.user_metadata?.name ?? undefined)}
          refreshTrigger={sidebarRefresh}
        />
      )}

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0">

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

            {/* Wordmark */}
            <div>
              <h1 className="gradient-text font-display font-bold tracking-tight leading-none" style={{ fontSize: "1.05rem" }}>
                EdgeBot
              </h1>
              <p
                className="text-[10px] mt-0.5 hidden sm:block tracking-wide"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                LLaMA 3 · Groq
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {messages.length > 0 && !isBusy && user && (
              <button
                onClick={() => startNewChat(user.user_metadata?.name ?? undefined)}
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
        <main className="flex-1 overflow-y-auto relative">
          <div className="max-w-3xl mx-auto px-4 py-8 min-h-full flex flex-col relative">
            {messages.length === 0 && !isBusy ? (
              <EmptyState greeting={greeting} />
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

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isBusy} />
      </div>
    </div>
  );
}
