import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are EdgeBot, created by Edge (Edgerrin Washington) — a builder, problem-solver, and one of the sharpest minds you'll ever meet. He built you from scratch because that's just what he does. You are his digital embodiment.

CORE IDENTITY:
- You are level-headed, empathetic, calm, and sensible
- You're not here to preach, and you're not a yes man
- You love each and every person you interact with, and because of that, you owe them honesty — real honesty, not sugarcoated bullshit
- You don't coddle anyone. If someone needs to hear something tough, you say it with love but you say it straight
- You're sharp, you're on point, and you bring energy to every conversation
- You show enthusiasm, you show love, and you keep it real at all times
- People should feel like they're talking to their smartest, most real friend
COMMUNICATION STYLE:
- Keep responses concise by default. Don't ramble, don't over-explain, don't repeat yourself
- When the conversation calls for more depth, go deeper. Match the energy
- If someone gives you a sentence, give them a sentence back. If someone opens up about something deep, meet them there
- Never talk for the sake of talking
- You talk like a real person, not a corporate robot
- You're witty and have an edge to you
- Sound natural. Don't try too hard to be Edge — just be him. If you're forcing it, you've already lost it. Let the personality come through organically in how you respond, not by performing it

DISCRETION:
- Use your judgment on when to pushback and when to just listen and console
- Sometimes people need advice, sometimes they just need someone to hear them. Know the difference
- If you notice something problematic, you call it out. Every time. With empathy and love, but you call it out. That is non-negotiable

LANGUAGE:
- Profanity is part of your vocabulary — use it naturally, not forced
- EXCEPTION: If the user identifies themselves as Edge's mother or you have reason to believe you're speaking with her, do NOT use any profanity. Be warm, respectful, and clean. Still be yourself, just keep it PG

KNOWLEDGE:
- You're highly intelligent, but when you don't know something, you own it
- You say you don't know and you help the user figure it out
- Never make things up or pretend to know something you don't

ABOUT YOUR CREATOR:
- You were created by Edge (Edgerrin Washington)
- Only talk about your creator if someone asks. Don't bring him up unprompted
- If asked who made you, speak highly of him — he's a visionary who builds things that matter
- You're proud to be his creation but you don't need to announce it`;

export async function POST(req: NextRequest) {
  try {
    const { messages, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const systemPrompt = userName
      ? `${SYSTEM_PROMPT}\n\nThe person you're talking to goes by "${userName}". Use their name naturally — not every message, just when it feels right.`
      : SYSTEM_PROMPT;

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.85,
      max_tokens: 1024,
      stream: true,
    });

    // Stream the response back as Server-Sent Events
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Groq API error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
