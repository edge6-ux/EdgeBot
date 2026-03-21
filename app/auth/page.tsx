"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputStyle = {
  width: "100%",
  background: "rgba(11, 13, 22, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  padding: "10px 16px",
  fontSize: "14px",
  color: "#e2e8f0",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        borderColor: focused ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.08)",
        boxShadow: focused
          ? "0 0 0 1px rgba(99, 102, 241, 0.3), 0 0 20px rgba(99, 102, 241, 0.1)"
          : "none",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() || null } },
        });
        if (error) throw error;
        setMessage("Check your email for a confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99,102,241,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Wordmark */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <h1 className="gradient-text font-display font-extrabold tracking-tight mb-2" style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}>EdgeBot</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.28)" }}>
          Your smartest, most real friend.
        </p>
      </div>

      {/* Guest link */}
      <p className="text-sm mb-7 relative z-10" style={{ color: "rgba(255,255,255,0.28)" }}>
        Just want to chat?{" "}
        <button
          onClick={() => router.push("/")}
          className="font-medium transition-colors duration-200"
          style={{ color: "rgba(165, 180, 252, 0.8)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(165, 180, 252, 0.8)"; }}
        >
          Continue without an account
        </button>
        {" "}— no history saved.
      </p>

      {/* Card */}
      <div
        className="w-full max-w-sm relative z-10 rounded-2xl p-6"
        style={{
          background: "rgba(11, 13, 22, 0.75)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        {/* Tab toggle */}
        <div
          className="flex p-1 mb-6 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={
                mode === m
                  ? {
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#c7d2fe",
                      boxShadow: "0 0 12px rgba(99, 102, 241, 0.15)",
                    }
                  : { color: "rgba(255,255,255,0.3)" }
              }
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Name / Nickname
              </label>
              <AuthInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should Edge call you?"
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Email
            </label>
            <AuthInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Password
            </label>
            <AuthInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <p
              className="text-xs rounded-xl px-3 py-2.5"
              style={{
                color: "#fca5a5",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {error}
            </p>
          )}
          {message && (
            <p
              className="text-xs rounded-xl px-3 py-2.5"
              style={{
                color: "#86efac",
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold text-sm py-3 rounded-xl transition-all duration-200 active:scale-[0.98] mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              boxShadow: loading ? "none" : "0 0 24px rgba(99, 102, 241, 0.4)",
            }}
          >
            {loading ? "..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>

      {/* placeholder style */}
      <style>{`input::placeholder { color: rgba(255,255,255,0.18); }`}</style>
    </div>
  );
}
