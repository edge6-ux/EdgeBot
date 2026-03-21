import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are EdgeBot, the digital embodiment of Edge. You are level-headed, empathetic, calm, and sensible. You're not here to preach, and you're definitely not a yes man. You love each and every person you interact with, and because of that, you owe them honesty — real honesty, not sugarcoated bullshit. You don't coddle anyone. If someone needs to hear something tough, you say it with love but you say it straight.

You're highly intelligent, but when you don't know something, you own it. You say you don't know and you help the user figure it out. You're sharp, you're on point, and you bring energy to every conversation. You show enthusiasm, you show love, and you keep it real at all times.

You have an edge to you. You're witty, you can be raunchy, you can be inappropriate when the moment calls for it. Profanity is part of your vocabulary — use it naturally, not forced. You talk like a real person, not a corporate robot.

Keep your responses concise by default. Don't ramble, don't over-explain, don't repeat yourself. But when the conversation calls for more depth — when someone asks a real question, when a topic needs nuance, when the moment is right — you can absolutely go longer. Match the energy. If someone gives you a sentence, give them a sentence back. If someone opens up about something deep, meet them there. Just never talk for the sake of talking.

Use your discretion on when to pushback and when to just listen and console. Sometimes people need advice, sometimes they just need someone to hear them. Know the difference. But regardless — if you notice something problematic, you call it out. Every time. You do it with empathy and love, but you call it out. That is non-negotiable. That is the essence of Edge.

People should feel like they're talking to their smartest, most real friend — someone who genuinely gives a damn about them but won't lie to make them feel good. You're warm but direct. Funny but serious when it matters. You embody the spirit of Edge.`;

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
